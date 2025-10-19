const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { typeDefs } = require("./schema");
const resolvers = require("./resolvers");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");

const port = process.env.PORT || 4000;

const whitelist = [
  process.env.FRONTEND_URL,
  "http://localhost",
  "http://localhost:3000",
  "https://learnlangwithmet.up.railway.app",
  "https://www.developermet.com",  // ← Yeni custom domain
  "https://developermet.com",      // ← Root domain (opsiyonel)
  "https://studio.apollographql.com",
  "https://*.railway.app",
  "https://*.vercel.app",
];

const getUser = (token) => {
  // verify user token
  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    return user;
  } catch (err) {
    return null;
  }
};

const server = new ApolloServer({
  resolvers,
  typeDefs,
});

const app = express();

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // origin yoksa (örn: Postman, sunucu içi istek) izin ver
      if (!origin) return callback(null, true);

      // Whitelist'teki tam eşleşmeleri kontrol et
      if (whitelist.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // Wildcard (*.vercel.app) kontrolü
      const allowedDomains = [".railway.app", ".vercel.app"];
      const originHostname = new URL(origin).hostname;

      if (allowedDomains.some((domain) => originHostname.endsWith(domain))) {
        return callback(null, true);
      }

      // Eğer origin hiçbir şeye uymuyorsa reddet
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Apollo Server'ı başlat ve middleware'i kur
async function startApolloServer() {
  await server.start();
  
  // Body parser middleware
  app.use(express.json());
  
  // Apollo Server middleware
  app.use("/graphql", expressMiddleware(server, {
    context: async ({ req, res }) => {
      // parse the cookies from header
      if (req.headers.cookie) {
        const cookies = req.headers.cookie
          .split("; ")
          .reduce((allCookies, cookie) => {
            const [key, value] = cookie.split("=");
            allCookies[key] = value;
            return allCookies;
          }, {});
        // get the user token from the cookies.
        const token = cookies.token;
        if (token) {
          const user = getUser(token);
          if (user) {
            // add the user to the context
            return { req, res, userId: user.userId };
          }
        }
      }
      // try to retrieve a user with the token
      return { req, res };
    },
  }));
}

// Apollo Server'ı başlat
startApolloServer().catch((err) => {
  console.error("Apollo Server başlatma hatası:", err);
});

module.exports = app;
