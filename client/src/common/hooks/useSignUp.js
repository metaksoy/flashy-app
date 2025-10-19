import { useApolloClient, gql } from "@apollo/client";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

export const useSignUp = () => {
  const client = useApolloClient();
  const navigate = useNavigate();

  const signup = async (variables) => {
    try {
      const { data } = await client.mutate({
        mutation: gql`
          mutation createUser($email: String!, $password: String!) {
            createUser(email: $email, password: $password)
          }
        `,
        variables,
      });
      
      // Başarılı kayıt
      await client.resetStore();
      navigate("/", { replace: true });
    } catch (error) {
      // Email zaten kullanılıyor hatası
      if (error.graphQLErrors?.some(err => err.extensions?.code === "EMAIL_ALREADY_EXISTS")) {
        toast.error("This Email Current");
      } else {
        // Diğer hatalar
        toast.error("Something went wrong. Please try again.");
      }
    }
  };
  return signup;
};
