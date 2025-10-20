import { useApolloClient, gql } from "@apollo/client";
import { useNavigate } from "react-router";

export const useLogout = () => {
  const client = useApolloClient();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // 1. Backend'de logout (cookie temizlenir)
      await client.query({
        query: gql`
          query logout {
            logout
          }
        `,
        fetchPolicy: "no-cache", // Cache'i bypass et
      });
      
      console.log("✅ Logout successful - Cookie cleared by backend");
      
      // 2. Apollo cache'i tamamen temizle
      await client.clearStore();
      
      // 3. Tam sayfa yenileme ile login sayfasına git (en garantili yöntem)
      window.location.href = "/signin";
    } catch (error) {
      // Hata olsa bile temizle ve çıkış yap
      console.error("Logout error:", error);
      await client.clearStore();
      
      // Tam sayfa yenileme ile çık
      window.location.href = "/signin";
    }
  };
  
  return logout;
};
