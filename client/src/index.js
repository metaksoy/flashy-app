import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const httpLink = createHttpLink({
  // Production'da nginx proxy kullan (same-origin), development'ta direkt backend'e git
  uri: process.env.NODE_ENV === "production" 
    ? "/graphql"  // Nginx proxy üzerinden (same-origin, Safari cookie sorunu yok!)
    : (process.env.REACT_APP_API_URL || "http://localhost:4000/graphql"),
  credentials: "include", // Cookie'leri her zaman gönder
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
        <ToastContainer
          toastStyle={{
            border: "2px solid #505050",
            boxShadow: "none",
            color: "#505050",
          }}
        />
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
