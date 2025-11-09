import styles from "./SignUp.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import TextInput from "../../common/components/TextInput";
import Button from "../../common/components/Button";
import { useSignUp } from "../../common/hooks/useSignUp";
import GoogleLoginButton from "../../common/components/GoogleLoginButton";

const SignUp = () => {
  const signup = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
  const hasGoogleAuth = !!googleClientId;

  return (
    <div className={styles.layout}>
      <Link to="/" className={styles.homeButton}>
        ← Ana Sayfa
      </Link>
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
        {hasGoogleAuth && (
          <>
            <div className={styles.divider}>
              <span>veya</span>
            </div>
            <GoogleLoginButton text="Google ile Üye Ol" />
          </>
        )}
      </form>
    </div>
  );
};

export default SignUp;
