import { useApolloClient, gql } from "@apollo/client";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

export const useSignUp = () => {
  const client = useApolloClient();
  const navigate = useNavigate();

  const signup = async (variables) => {
    client
      .mutate({
        mutation: gql`
          mutation createUser($email: String!, $password: String!) {
            createUser(email: $email, password: $password)
          }
        `,
        variables,
      })
      .then((data) => {
        if (data.data === null) {
          toast.error("Something went wrong :(");
        } else {
          client.resetStore().then(() => navigate("/", { replace: true }));
        }
      })
      .catch((error) => {
        // Email zaten kullanılıyor hatası
        if (error.graphQLErrors?.some(err => err.extensions?.code === "EMAIL_ALREADY_EXISTS")) {
          toast.error("Bu Eposta kullanılmaktadır!");
        } else {
          // Diğer hatalar
          toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
        }
      });
  };
  return signup;
};
