import { useApolloClient, gql } from "@apollo/client";
import { toast } from "react-toastify";

export const useGoogleLogin = () => {
  const client = useApolloClient();

  const googleLogin = async (idToken) => {
    try {
      const { data } = await client.mutate({
        mutation: gql`
          mutation googleLogin($idToken: String!) {
            googleLogin(idToken: $idToken)
          }
        `,
        variables: { idToken },
      });
      
      console.log("Google login successful, token received:", data?.googleLogin ? "Yes" : "No");
      
      // Başarılı giriş - Store'u resetle ve sayfayı yenile
      // Cookie set edildi, şimdi sayfayı yenileyerek isAuthenticated query'sinin tekrar çalışmasını sağla
      await client.resetStore();
      
      // Hard redirect yaparak profil sayfasına yönlendir
      // Bu sayede isAuthenticated query'si cookie'yi okuyabilir
      window.location.href = "/profile";
      
    } catch (error) {
      console.error("Google login error:", error);
      if (error.graphQLErrors?.some(err => err.extensions?.code === "GOOGLE_EMAIL_MISSING")) {
        toast.error("Google hesabınızdan email bilgisi alınamadı");
      } else if (error.graphQLErrors?.some(err => err.extensions?.code === "GOOGLE_LOGIN_ERROR")) {
        toast.error("Google ile giriş yapılırken bir hata oluştu");
      } else {
        toast.error("Google ile giriş yapılırken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
      }
    }
  };

  return googleLogin;
};

