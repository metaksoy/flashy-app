import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../contexts/LanguageContext";
import LanguageSelector from "../../common/components/LanguageSelector";
import styles from "./HowItWorks.module.css";

const HowItWorks = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: t("step1Title"),
      description: t("step1Desc"),
      icon: "📚",
    },
    {
      title: t("step2Title"),
      description: t("step2Desc"),
      icon: "🃏",
    },
    {
      title: t("step3Title"),
      description: t("step3Desc"),
      icon: "🎓",
    },
    {
      title: t("step4Title"),
      description: t("step4Desc"),
      icon: "🔄",
    },
    {
      title: t("step5Title"),
      description: t("step5Desc"),
      icon: "✍️",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className={styles.container}>
      <div style={{ position: "absolute", top: "1rem", left: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to="/" className={styles.homeButton}>
          ← {t("home")}
        </Link>
        <LanguageSelector />
      </div>
      
      <div className={styles.content}>
        <h1 className={styles.title}>{t("howItWorksTitle")}</h1>
        
        <div className={styles.slider}>
          <div className={styles.sliderContent}>
            <div
              className={styles.slides}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className={styles.slide}>
                  <div className={styles.slideIcon}>{slide.icon}</div>
                  <h2 className={styles.slideTitle}>{slide.title}</h2>
                  <p className={styles.slideDescription}>{slide.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sliderControls}>
            <button
              className={styles.navButton}
              onClick={prevSlide}
              aria-label={t("previous")}
            >
              ←
            </button>
            
            <div className={styles.dots}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${
                    index === currentSlide ? styles.dotActive : ""
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              className={styles.navButton}
              onClick={nextSlide}
              aria-label={t("next")}
            >
              →
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <p>{t("readyToStart")}</p>
          <div className={styles.actionButtons}>
            <Link to="/signin" className={styles.signInButton}>
              {t("signIn")}
            </Link>
            <Link to="/signup" className={styles.signUpButton}>
              {t("signUp")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;


