const { prisma } = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");
const { OAuth2Client } = require("google-auth-library");

// Cookie options helper - Signin ve Logout'ta aynı ayarlar kullanılmalı
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
  
  // Production'da domain belirtme (cross-domain için gerekli olabilir)
  // Railway veya custom domain kullanıyorsanız, domain'i belirtmeyin
  // Browser otomatik olarak doğru domain'i kullanacak
  
  return options;
};

const resolvers = {
  Query: {
    logout: (parent, args, context) => {
      // Cookie'yi sil - Production'da da çalışması için tüm ayarlar aynı olmalı
      const cookieOptions = getCookieOptions();
      
      console.log("🔴 Logout called - Cookie options:", cookieOptions);
      console.log("🔴 Current cookies:", context.req.headers.cookie);
      
      // MaxAge'i 0 yap ve geçmiş tarih ver
      context.res.cookie("token", "", {
        ...cookieOptions,
        maxAge: 0,
        expires: new Date(0),
      });
      
      // Ayrıca clearCookie de çağır
      context.res.clearCookie("token", cookieOptions);
      
      console.log("✅ Logout completed - Cookie should be cleared");
      
      return true;
    },
    isAuthenticated: (parent, args, context) => {
      return !!context.userId;
    },
    user: (parent, args, context) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      return prisma.user.findFirst({
        where: {
          id: context.userId,
        },
        include: {
          decks: { include: { flashcards: true } },
          flashcards: true,
          quizzes: { include: { words: true } },
        },
      });
    },
    deck: (parent, args, context) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      return prisma.deck.findFirst({
        where: {
          id: args.id,
          // only return decks that belong to the user
          userId: context.userId,
        },
        include: {
          flashcards: {
            orderBy: {
              retention: "desc",
            },
          },
        },
      });
    },
    newFlashcards: (parent, args, context) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      return prisma.flashcard.findMany({
        where: {
          userId: context.userId,
          new: true,
        },
      });
    },
    dueFlashcards: (parent, args, context) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      return prisma.flashcard.findMany({
        where: {
          userId: context.userId,
          new: false,
          due: {
            lt: new Date(),
          },
        },
      });
    },
    newFromDeck: (parent, args, context) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      return prisma.flashcard.findMany({
        where: {
          deckId: args.deckId,
          userId: context.userId,
          new: true,
        },
      });
    },
    dueFromDeck: (parent, args, context) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      return prisma.flashcard.findMany({
        where: {
          deckId: args.deckId,
          userId: context.userId,
          new: false,
          due: {
            lt: new Date(),
          },
        },
      });
    },
    quiz: (parent, args, context) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      return prisma.quiz.findFirst({
        where: {
          id: args.id,
          userId: context.userId,
        },
        include: {
          words: true,
        },
      });
    },
  },
  Mutation: {
    createUser: async (parent, { email, password }, context, info) => {
      const { res } = context;
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      });
      
      if (existingUser) {
        throw new GraphQLError("Bu email adresi zaten kullanılıyor", {
          extensions: { code: "EMAIL_ALREADY_EXISTS" },
        });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
        },
      });
      // Since id is added by prisma it is unavailable when creating a user.
      const userWithToken = {
        ...user,
        token: jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET, {
          expiresIn: process.env.TOKEN_EXPIRY,
        }),
      };
      res.cookie("token", userWithToken.token, {
        ...getCookieOptions(),
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
      return userWithToken.token;
    },
    loginUser: async (parent, { email, password }, context, info) => {
      const { res } = context;
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });
      if (!user) {
        throw new Error("No User Found");
      }
      // Google ile giriş yapan kullanıcıların şifresi olmayabilir
      if (!user.password || user.password === "") {
        throw new GraphQLError("Bu hesap Google ile giriş yapmak için kullanılıyor. Lütfen Google ile giriş yapın.", {
          extensions: { code: "GOOGLE_ACCOUNT" },
        });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Wrong Password");
      }
      const userWithToken = {
        ...user,
        token: jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET, {
          expiresIn: process.env.TOKEN_EXPIRY,
        }),
      };
      res.cookie("token", userWithToken.token, {
        ...getCookieOptions(),
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
      return userWithToken.token;
    },
    googleLogin: async (parent, { idToken }, context, info) => {
      const { res } = context;
      
      try {
        // Google OAuth client oluştur
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        // Token'ı doğrula
        const ticket = await client.verifyIdToken({
          idToken: idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
        
        if (!email) {
          throw new GraphQLError("Google hesabınızdan email bilgisi alınamadı", {
            extensions: { code: "GOOGLE_EMAIL_MISSING" },
          });
        }
        
        // Kullanıcıyı bul veya oluştur
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId: googleId },
              { email: email },
            ],
          },
        });
        
        if (!user) {
          // Yeni kullanıcı oluştur
          user = await prisma.user.create({
            data: {
              email: email,
              googleId: googleId,
              name: name || "",
              avatar: picture || "",
              provider: "google",
            },
          });
        } else {
          // Mevcut kullanıcıyı güncelle (Google ID yoksa ekle)
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: googleId,
                provider: "google",
                name: name || user.name || "",
                avatar: picture || user.avatar || "",
              },
            });
          }
        }
        
        // JWT token oluştur
        const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET, {
          expiresIn: process.env.TOKEN_EXPIRY,
        });
        
        // Cookie'ye token'ı kaydet
        res.cookie("token", token, {
          ...getCookieOptions(),
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });
        
        return token;
      } catch (error) {
        console.error("Google login error:", error);
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError("Google ile giriş yapılırken bir hata oluştu", {
          extensions: { code: "GOOGLE_LOGIN_ERROR" },
        });
      }
    },
    createDeck: async (parent, { name }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      const deck = await prisma.deck.create({
        data: {
          name,
          userId: context.userId,
        },
      });
      return deck;
    },
    createFlashcard: async (parent, { data }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      const flashcard = await prisma.flashcard.create({
        data: {
          ...data,
          userId: context.userId,
        },
      });
      return flashcard;
    },
    updateFlashcard: async (parent, { data }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      const flashcard = await prisma.flashcard.update({
        where: { id: data.id },
        data: {
          front: data.front,
          back: data.back,
          due: data.due,
          reviews: data.reviews,
          retention: data.retention,
          new: data.new,
          nextReview: data.nextReview,
          mastered: data.mastered,
        },
      });
      return flashcard;
    },
    deleteFlashcard: async (parent, { id }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      const flashcard = await prisma.flashcard.delete({
        where: { id },
      });
      return flashcard;
    },
    deleteDeck: async (parent, { id }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      // delete all flashcards in the deck first
      await prisma.flashcard.deleteMany({
        where: {
          deckId: id,
        },
      });
      // delete the deck itself
      const deck = await prisma.deck.delete({
        where: { id },
      });
      return deck;
    },
    createQuiz: async (parent, { name }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      const quiz = await prisma.quiz.create({
        data: {
          name: name,
          userId: context.userId,
        },
        include: {
          words: true,
        },
      });
      return quiz;
    },
    deleteQuiz: async (parent, { id }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      // delete all quiz words first
      await prisma.quizWord.deleteMany({
        where: {
          quizId: id,
        },
      });
      // delete the quiz itself
      const quiz = await prisma.quiz.delete({
        where: { id },
      });
      return quiz;
    },
    createQuizWord: async (parent, { data }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      const quizWord = await prisma.quizWord.create({
        data: {
          word: data.word,
          definition: data.definition,
          quizId: data.quizId,
        },
      });
      return quizWord;
    },
    deleteQuizWord: async (parent, { id }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      const quizWord = await prisma.quizWord.delete({
        where: { id },
      });
      return quizWord;
    },
  },
};

module.exports = resolvers;