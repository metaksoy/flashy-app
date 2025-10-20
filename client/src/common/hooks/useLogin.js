import { useApolloClient, gql } from "@apollo/client";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

export const useLogin = () => {
  const client = useApolloClient();
  const navigate = useNavigate();

  const login = async (variables) => {
    client
      .mutate({
        mutation: gql`
          mutation loginUser($email: String!, $password: String!) {
            loginUser(email: $email, password: $password)
          }
        `,
        variables,
      })
      .then((data) => {
        if (data.data === null) {
          toast.error("Geçersiz email veya şifre");
        } else {
          console.log("✅ Login successful - Cookie set by backend");
          
          // Cache'i temizle ve yönlendir
          client.resetStore().then(() => {
            // Tam sayfa yenileme ile auth state'i güncelle
            window.location.href = "/";
          });
        }
      })
      .catch((error) => {
        // Login hataları
        if (error.message?.includes("No User Found")) {
          toast.error("Bu email adresi ile kayıtlı kullanıcı bulunamadı");
        } else if (error.message?.includes("Wrong Password")) {
          toast.error("Şifreniz yanlış");
        } else {
          console.error("Login error:", error);
          toast.error("Giriş yapılırken bir hata oluştu");
        }
      });
  };
  return login;
};
