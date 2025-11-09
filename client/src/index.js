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
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_API_URL || "http://localhost:4000/graphql",
  credentials: "include",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

const AppWrapper = () => (
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
);

ReactDOM.render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <AppWrapper />
      </GoogleOAuthProvider>
    ) : (
      <AppWrapper />
    )}
  </React.StrictMode>,
  document.getElementById("root")
);
