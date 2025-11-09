import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin as useGoogleLoginHook } from "../../hooks/useGoogleLogin";
import styles from "./GoogleLoginButton.module.css";

const GoogleLoginButton = ({ text = "Google ile Giriş Yap" }) => {
  const googleLogin = useGoogleLoginHook();

  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (credentialResponse?.credential) {
          googleLogin(credentialResponse.credential);
        }
      }}
      onError={() => {
        console.error("Google login failed");
      }}
      useOneTap={false}
      theme="outline"
      size="large"
      text="signin_with"
      shape="rectangular"
      locale="tr"
    />
  );
};

export default GoogleLoginButton;

