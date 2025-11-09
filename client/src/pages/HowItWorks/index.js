import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./HowItWorks.module.css";

const HowItWorks = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "1. Deck Oluştur",
      description: "Öğrenmek istediğin konular için deck'ler oluştur. Her deck bir konu başlığıdır.",
      icon: "📚",
    },
    {
      title: "2. Flashcard Ekle",
      description: "Deck'ine flashcard'lar ekle. Her flashcard'ın ön yüzünde soru, arka yüzünde cevap olur.",
      icon: "🃏",
    },
    {
      title: "3. Öğren",
      description: "Yeni flashcard'ları öğren. Her flashcard'ı doğru cevapladığında bir sonraki seviyeye geçersin.",
      icon: "🎓",
    },
    {
      title: "4. Tekrar Et",
      description: "Spaced Repetition sistemi sayesinde öğrendiklerini zamanında tekrar ederek unutmayı önle.",
      icon: "🔄",
    },
    {
      title: "5. Quiz Yap",
      description: "Öğrendiklerini test etmek için quiz'ler oluştur ve kendini sına.",
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
      <Link to="/" className={styles.homeButton}>
        ← Ana Sayfa
      </Link>
      
      <div className={styles.content}>
        <h1 className={styles.title}>Nasıl Çalışır?</h1>
        
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
              aria-label="Önceki"
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
              aria-label="Sonraki"
            >
              →
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <p>Hazırsan başlamak için giriş yap!</p>
          <div className={styles.actionButtons}>
            <Link to="/signin" className={styles.signInButton}>
              Giriş Yap
            </Link>
            <Link to="/signup" className={styles.signUpButton}>
              Üye Ol
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;

