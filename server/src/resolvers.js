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

// Default örnek deck ve quiz oluşturma fonksiyonu
const createDefaultExamples = async (userId) => {
  try {
    // Örnek Deck oluştur
    const exampleDeck = await prisma.deck.create({
      data: {
        name: "Örnek Deck - İngilizce Kelimeler",
        userId: userId,
      },
    });

    // Örnek Deck'e flashcard'lar ekle
    const exampleFlashcards = [
      { front: "Hello", back: "Merhaba" },
      { front: "Goodbye", back: "Hoşça kal" },
      { front: "Thank you", back: "Teşekkür ederim" },
      { front: "Please", back: "Lütfen" },
      { front: "Yes", back: "Evet" },
    ];

    for (const flashcard of exampleFlashcards) {
      await prisma.flashcard.create({
        data: {
          front: flashcard.front,
          back: flashcard.back,
          deckId: exampleDeck.id,
          userId: userId,
          new: true,
        },
      });
    }

    // Örnek Quiz oluştur
    const exampleQuiz = await prisma.quiz.create({
      data: {
        name: "Örnek Quiz - Temel Kelimeler",
        userId: userId,
      },
    });

    // Örnek Quiz'e kelimeler ekle
    const exampleWords = [
      { word: "Apple", definition: "Elma" },
      { word: "Book", definition: "Kitap" },
      { word: "Cat", definition: "Kedi" },
      { word: "Dog", definition: "Köpek" },
    ];

    for (const word of exampleWords) {
      await prisma.quizWord.create({
        data: {
          word: word.word,
          definition: word.definition,
          quizId: exampleQuiz.id,
        },
      });
    }

    console.log(`✅ Default examples created for user ${userId}`);
  } catch (error) {
    console.error("Error creating default examples:", error);
    // Hata olsa bile kullanıcı oluşturma işlemi devam etsin
  }
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
      
      // Yeni kullanıcı için örnek deck ve quiz oluştur
      await createDefaultExamples(user.id);
      
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
          
          // Yeni kullanıcı için örnek deck ve quiz oluştur
          await createDefaultExamples(user.id);
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
    updateDeck: async (parent, { id, name }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      // Kullanıcının deck'ine ait olduğunu kontrol et
      const deck = await prisma.deck.findFirst({
        where: {
          id: id,
          userId: context.userId,
        },
      });
      if (!deck) {
        throw new GraphQLError("Deck bulunamadı veya bu deck size ait değil", {
          extensions: { code: "DECK_NOT_FOUND" },
        });
      }
      const updatedDeck = await prisma.deck.update({
        where: { id },
        data: { name },
      });
      return updatedDeck;
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
    updateQuiz: async (parent, { id, name }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      // Kullanıcının quiz'ine ait olduğunu kontrol et
      const quiz = await prisma.quiz.findFirst({
        where: {
          id: id,
          userId: context.userId,
        },
      });
      if (!quiz) {
        throw new GraphQLError("Quiz bulunamadı veya bu quiz size ait değil", {
          extensions: { code: "QUIZ_NOT_FOUND" },
        });
      }
      const updatedQuiz = await prisma.quiz.update({
        where: { id },
        data: { name },
        include: {
          words: true,
        },
      });
      return updatedQuiz;
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
      // Quiz'in kullanıcıya ait olduğunu kontrol et
      const quiz = await prisma.quiz.findFirst({
        where: {
          id: data.quizId,
          userId: context.userId,
        },
      });
      if (!quiz) {
        throw new GraphQLError("Quiz bulunamadı veya bu quiz size ait değil", {
          extensions: { code: "QUIZ_NOT_FOUND" },
        });
      }
      const quizWord = await prisma.quizWord.create({
        data: {
          word: data.word,
          definition: data.definition,
          quizId: data.quizId,
        },
      });
      return quizWord;
    },
    updateQuizWord: async (parent, { id, word, definition }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      // QuizWord'ün kullanıcıya ait quiz'ine ait olduğunu kontrol et
      const quizWord = await prisma.quizWord.findFirst({
        where: { id },
        include: {
          quiz: true,
        },
      });
      if (!quizWord || quizWord.quiz.userId !== context.userId) {
        throw new GraphQLError("Quiz kelimesi bulunamadı veya bu kelime size ait değil", {
          extensions: { code: "QUIZ_WORD_NOT_FOUND" },
        });
      }
      const updateData = {};
      if (word !== undefined) updateData.word = word;
      if (definition !== undefined) updateData.definition = definition;
      const updatedQuizWord = await prisma.quizWord.update({
        where: { id },
        data: updateData,
      });
      return updatedQuizWord;
    },
    deleteQuizWord: async (parent, { id }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      // QuizWord'ün kullanıcıya ait quiz'ine ait olduğunu kontrol et
      const quizWord = await prisma.quizWord.findFirst({
        where: { id },
        include: {
          quiz: true,
        },
      });
      if (!quizWord || quizWord.quiz.userId !== context.userId) {
        throw new GraphQLError("Quiz kelimesi bulunamadı veya bu kelime size ait değil", {
          extensions: { code: "QUIZ_WORD_NOT_FOUND" },
        });
      }
      const deletedQuizWord = await prisma.quizWord.delete({
        where: { id },
      });
      return deletedQuizWord;
    },
    addFlashcardToQuiz: async (parent, { flashcardId, quizId }, context, info) => {
      if (!context.userId) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      // Flashcard'ın kullanıcıya ait olduğunu kontrol et
      const flashcard = await prisma.flashcard.findFirst({
        where: {
          id: flashcardId,
          userId: context.userId,
        },
      });
      if (!flashcard) {
        throw new GraphQLError("Flashcard bulunamadı veya bu flashcard size ait değil", {
          extensions: { code: "FLASHCARD_NOT_FOUND" },
        });
      }
      // Quiz'in kullanıcıya ait olduğunu kontrol et
      const quiz = await prisma.quiz.findFirst({
        where: {
          id: quizId,
          userId: context.userId,
        },
      });
      if (!quiz) {
        throw new GraphQLError("Quiz bulunamadı veya bu quiz size ait değil", {
          extensions: { code: "QUIZ_NOT_FOUND" },
        });
      }
      // Flashcard'dan kelime ve tanımı al, quiz'e ekle
      const quizWord = await prisma.quizWord.create({
        data: {
          word: flashcard.front || "",
          definition: flashcard.back || "",
          quizId: quizId,
        },
      });
      return quizWord;
    },
  },
};

module.exports = resolvers;