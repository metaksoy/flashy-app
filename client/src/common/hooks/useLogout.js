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
      });
      
      // 2. Apollo cache'i tamamen temizle
      await client.clearStore();
      
      // 3. Login sayfasına yönlendir
      navigate("/signin", { replace: true });
    } catch (error) {
      // Hata olsa bile cache'i temizle ve çıkış yap
      await client.clearStore();
      navigate("/signin", { replace: true });
    }
  };
  
  return logout;
};
