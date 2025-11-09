import styles from "./SignIn.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import TextInput from "../../common/components/TextInput";
import Button from "../../common/components/Button";
import { useLogin } from "../../common/hooks/useLogin";
import GoogleLoginButton from "../../common/components/GoogleLoginButton";
import { useTranslation } from "../../contexts/LanguageContext";
import LanguageSelector from "../../common/components/LanguageSelector";

const SignIn = () => {
  const { t } = useTranslation();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
  const hasGoogleAuth = !!googleClientId;

  return (
    <div className={styles.layout}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.homeButton}>
          ← {t("home")}
        </Link>
        <LanguageSelector />
      </div>
      <form
        className={styles.form}
        onSubmit={() => {
          login({ email, password });
        }}
      >
        <h1 className={styles.title}>{t("signInTitle")}</h1>
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
            login({ email, password });
            setEmail("");
            setPassword("");
          }}
        >
          {t("signInTitle")}
        </Button>
        {hasGoogleAuth && (
          <>
            <div className={styles.divider}>
              <span>{t("or")}</span>
            </div>
            <GoogleLoginButton text={t("googleSignIn")} />
          </>
        )}
      </form>
    </div>
  );
};

export default SignIn;
