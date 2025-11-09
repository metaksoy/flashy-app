import styles from "./SignIn.module.css";
import { useState } from "react";
import TextInput from "../../common/components/TextInput";
import Button from "../../common/components/Button";
import { useLogin } from "../../common/hooks/useLogin";
import { useGoogleLogin } from "../../common/hooks/useGoogleLogin";
import { useGoogleLogin as useGoogleOAuthLogin } from "@react-oauth/google";

const SignIn = () => {
  const login = useLogin();
  const googleLogin = useGoogleLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleOAuthLogin = useGoogleOAuthLogin({
    onSuccess: (tokenResponse) => {
      // tokenResponse.credential contains the ID token
      googleLogin(tokenResponse.credential);
    },
    onError: () => {
      console.error("Google login failed");
    },
  });

  return (
    <div className={styles.layout}>
      <form
        className={styles.form}
        onSubmit={() => {
          login({ email, password });
        }}
      >
        <h1 className={styles.title}>Sign In</h1>
        <TextInput 
          label="Email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email..."
          type="email"
          required
        />
        <TextInput 
          label="Password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password..."
          type="password"
          required
        />
        <Button
          onClick={(event) => {
            event.preventDefault();
            login({ email, password });
            setEmail("");
            setPassword("");
          }}
        >
          Sign In
        </Button>
        <div className={styles.divider}>
          <span>veya</span>
        </div>
        <Button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            handleGoogleOAuthLogin();
          }}
          style={{ backgroundColor: "#4285F4", color: "white" }}
        >
          Google ile Giriş Yap
        </Button>
      </form>
    </div>
  );
};

export default SignIn;
