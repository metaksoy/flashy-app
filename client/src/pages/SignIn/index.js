import styles from "./SignIn.module.css";
import { useState } from "react";
import TextInput from "../../common/components/TextInput";
import Button from "../../common/components/Button";
import { useLogin } from "../../common/hooks/useLogin";
import GoogleLoginButton from "../../common/components/GoogleLoginButton";

const SignIn = () => {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
  const hasGoogleAuth = !!googleClientId;

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
        {hasGoogleAuth && (
          <>
            <div className={styles.divider}>
              <span>veya</span>
            </div>
            <GoogleLoginButton text="Google ile Giriş Yap" />
          </>
        )}
      </form>
    </div>
  );
};

export default SignIn;
