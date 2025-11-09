import { useGoogleLogin } from "@react-oauth/google";
import { useGoogleLogin as useGoogleLoginHook } from "../../hooks/useGoogleLogin";
import Button from "../Button";
import styles from "./GoogleLoginButton.module.css";

const GoogleLoginButton = ({ text = "Google ile Giriş Yap" }) => {
  const googleLogin = useGoogleLoginHook();

  const handleGoogleOAuthLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse?.credential) {
        googleLogin(tokenResponse.credential);
      }
    },
    onError: () => {
      console.error("Google login failed");
    },
  });

  return (
    <Button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        handleGoogleOAuthLogin();
      }}
      style={{ backgroundColor: "#4285F4", color: "white" }}
    >
      {text}
    </Button>
  );
};

export default GoogleLoginButton;

