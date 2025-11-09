import styles from "./Landing.module.css";
import logo from "../../common/logo.svg";
import screenshot from "./screenshot.png";
import { Link } from "react-router-dom";
import { useTranslation } from "../../contexts/LanguageContext";
import LanguageSelector from "../../common/components/LanguageSelector";

const Landing = () => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <LanguageSelector />
        <Link to="/how-it-works" className={styles.link}>
          {t("howItWorks")}
        </Link>{"  "}
        <Link to="/signin" className={styles.link}>
          {t("signIn")}
        </Link>{" "}
        <Link to="/signup" className={styles.link}>
          {t("signUp")}
        </Link>
      </div>
      <div className={styles.content}>
        <div className={styles.column1}>
          <img src={logo} alt="Flashy logo"></img>
          <p>
            {t("landingDescription")}
          </p>
          {/* <p>The future of flashcards has been redesigned.</p> */}
        </div>
        <div className={styles.column2}>
          <img
            className={styles.screenshot}
            src={screenshot}
            alt="Flashy screenshot"
          ></img>
        </div>
      </div>
    </div>
  );
};

export default Landing;
