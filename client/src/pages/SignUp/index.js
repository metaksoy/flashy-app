import styles from "./SignUp.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import TextInput from "../../common/components/TextInput";
import Button from "../../common/components/Button";
import { useSignUp } from "../../common/hooks/useSignUp";
import GoogleLoginButton from "../../common/components/GoogleLoginButton";
import { useTranslation } from "../../contexts/LanguageContext";
import LanguageSelector from "../../common/components/LanguageSelector";

const SignUp = () => {
  const { t } = useTranslation();
  const signup = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
  const hasGoogleAuth = !!googleClientId;

  return (
    <div className={styles.layout}>
      <div style={{ position: "absolute", top: "1rem", left: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to="/" className={styles.homeButton}>
          ← {t("home")}
        </Link>
        <LanguageSelector />
      </div>
      <form
        className={styles.form}
        onSubmit={() => {
          signup({ email, password });
        }}
      >
        <h1 className={styles.title}>{t("signUpTitle")}</h1>
        <TextInput 
          label={t("email")}
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("enterEmail")}
          type="email"
          required
        />
        <TextInput 
          label={t("password")}
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("enterPassword")}
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
          {t("signUpTitle")}
        </Button>
        {hasGoogleAuth && (
          <>
            <div className={styles.divider}>
              <span>{t("or")}</span>
            </div>
            <GoogleLoginButton text={t("googleSignUp")} />
          </>
        )}
      </form>
    </div>
  );
};

export default SignUp;
