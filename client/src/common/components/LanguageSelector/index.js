import { useTranslation } from '../../../contexts/LanguageContext';
import styles from './LanguageSelector.module.css';

const LanguageSelector = () => {
  const { language, changeLanguage } = useTranslation();

  return (
    <div className={styles.languageSelector}>
      <button
        className={`${styles.langButton} ${language === 'tr' ? styles.active : ''}`}
        onClick={() => changeLanguage('tr')}
        title="Türkçe"
      >
        TR
      </button>
      <button
        className={`${styles.langButton} ${language === 'en' ? styles.active : ''}`}
        onClick={() => changeLanguage('en')}
        title="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSelector;

