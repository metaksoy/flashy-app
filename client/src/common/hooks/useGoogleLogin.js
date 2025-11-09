import { useApolloClient, gql } from "@apollo/client";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

export const useGoogleLogin = () => {
  const client = useApolloClient();
  const navigate = useNavigate();

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
      
      // Başarılı giriş
      await client.resetStore();
      navigate("/", { replace: true });
      toast.success("Google ile başarıyla giriş yapıldı");
    } catch (error) {
      console.error("Google login error:", error);
      if (error.graphQLErrors?.some(err => err.extensions?.code === "GOOGLE_EMAIL_MISSING")) {
        toast.error("Google hesabınızdan email bilgisi alınamadı");
      } else if (error.graphQLErrors?.some(err => err.extensions?.code === "GOOGLE_LOGIN_ERROR")) {
        toast.error("Google ile giriş yapılırken bir hata oluştu");
      } else {
        toast.error("Google ile giriş yapılırken bir hata oluştu");
      }
    }
  };

  return googleLogin;
};

