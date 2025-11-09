import styles from "./SignUp.module.css";
import { useState } from "react";
import TextInput from "../../common/components/TextInput";
import Button from "../../common/components/Button";
import { useSignUp } from "../../common/hooks/useSignUp";
import { useGoogleLogin } from "../../common/hooks/useGoogleLogin";
import { useGoogleLogin as useGoogleOAuthLogin } from "@react-oauth/google";

const SignUp = () => {
  const signup = useSignUp();
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
          signup({ email, password });
        }}
      >
        <h1 className={styles.title}>Sign Up</h1>
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
            signup({ email, password });
            setEmail("");
            setPassword("");
          }}
        >
          Sign Up
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
          Google ile Üye Ol
        </Button>
      </form>
    </div>
  );
};

export default SignUp;
