import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  tr: {
    // Common
    home: "Ana Sayfa",
    cancel: "İptal",
    save: "Kaydet",
    delete: "Sil",
    edit: "Düzenle",
    close: "Kapat",
    add: "Ekle",
    confirm: "Onayla",
    yes: "Evet",
    no: "Hayır",
    
    // Navigation
    signIn: "Giriş Yap",
    signUp: "Üye Ol",
    signOut: "Çıkış Yap",
    profile: "Profilim",
    howItWorks: "Nasıl Çalışır?",
    
    // Landing
    landingDescription: "Beklediğiniz kolay kullanımlı aralıklı tekrar sistemi!",
    
    // Sign In/Up
    email: "Email",
    password: "Şifre",
    enterEmail: "Email adresinizi girin...",
    enterPassword: "Şifrenizi girin...",
    signInTitle: "Giriş Yap",
    signUpTitle: "Üye Ol",
    or: "veya",
    googleSignIn: "Google ile Giriş Yap",
    googleSignUp: "Google ile Üye Ol",
    
    // Dashboard
    dashboard: "Pano",
    yourDecks: "Desteleriniz",
    yourQuizzes: "Quizleriniz",
    noDecksYet: "Henüz deck yok. İlk deck'inizi oluşturun!",
    noQuizzesYet: "Henüz quiz yok. İlk quiz'inizi oluşturun!",
    
    // Sidebar
    dueToday: "Bugün Tekrar Edilecekler",
    learnNew: "Yeni Öğren",
    quiz: "Quiz",
    logOut: "Çıkış Yap",
    loadingDecks: "Desteler yükleniyor...",
    couldntLoadDecks: "Desteler yüklenemedi :(",
    loadingQuizzes: "Quizler yükleniyor...",
    couldntLoadQuizzes: "Quizler yüklenemedi :(",
    
    // Deck
    cards: "kartlar",
    card: "kart",
    studyDue: "Tekrar Et",
    retention: "hatırlama oranı",
    createNewDeck: "Yeni Deck Oluştur",
    deckName: "Deck İsmi",
    enterDeckName: "Deck ismini girin...",
    createDeck: "Deck Oluştur",
    editDeckName: "Deck İsmini Düzenle",
    deckNameUpdated: "Deck ismi güncellendi",
    deleteDeck: "Bu deck'i silmek istediğinize emin misiniz?",
    deckDeleted: "Deck başarıyla silindi!",
    deckNotFound: "Deck bulunamadı",
    clickToEditName: "İsmi düzenlemek için tıklayın",
    
    // Flashcard
    front: "Front",
    back: "Back",
    addCard: "Add Card",
    editCard: "Edit Card",
    deleteCard: "Delete Card",
    deleteCardConfirm: "Are you sure you want to delete this card?",
    
    // Quiz
    quizzes: "Quizleriniz",
    createQuiz: "Quiz Oluştur",
    quizCreated: "Quiz başarıyla oluşturuldu!",
    creating: "Oluşturuluyor...",
    quizName: "Quiz İsmi",
    enterQuizName: "Quiz ismini girin...",
    createQuizButton: "Quiz Oluştur",
    words: "kelimeler",
    word: "kelime",
    deleteQuiz: "Bu quiz'i silmek istediğinize emin misiniz?",
    quizDeleted: "Quiz başarıyla silindi!",
    addWord: "Kelime Ekle",
    addWordFromFlashcard: "Flashcard'dan Kelime Ekle",
    bulkImport: "Toplu İçe Aktar",
    startQuiz: "Quiz Başlat",
    wordLabel: "Kelime",
    definitionLabel: "Tanım",
    enterWord: "Kelimeyi girin...",
    enterDefinition: "Tanımı girin...",
    editQuizName: "Quiz İsmini Düzenle",
    editWord: "Kelimeyi Düzenle",
    quizNameUpdated: "Quiz ismi güncellendi",
    wordUpdated: "Kelime güncellendi",
    wordAdded: "Kelime başarıyla eklendi!",
    wordDeleted: "Kelime başarıyla silindi!",
    flashcardAdded: "Flashcard quiz'e eklendi",
    noFlashcardsYet: "Henüz flashcard yok. Önce bir deck oluşturun ve flashcard ekleyin.",
    wordsLabel: "Kelimeler",
    noWordsYet: "Henüz kelime yok. Başlamak için kelime ekleyin!",
    clickToEdit: "Düzenlemek için tıklayın",
    editWordTitle: "Kelimeyi düzenle",
    deleteWordTitle: "Kelimeyi sil",
    bulkImportTitle: "Toplu Kelime İçe Aktarma",
    bulkImportInstructions: "Aşağıdaki formatlardan birini kullanarak birden fazla kelime ekleyin:",
    csvFormat: "CSV Formatı:",
    dashFormat: "Tire Formatı:",
    bulkImportPlaceholder: "Kelimeleri buraya girin...\n\nÖrnek:\napple,elma\nbanana,muz\norange,portakal",
    importWords: "Kelimeleri İçe Aktar",
    
    // Profile
    profileTitle: "Profilim",
    user: "Kullanıcı",
    statistics: "İstatistikler",
    accountInfo: "Hesap Bilgileri",
    membershipDate: "Üye Olma Tarihi:",
    loginMethod: "Giriş Yöntemi:",
    google: "Google",
    emailPassword: "Email/Şifre",
    unknown: "Bilinmiyor",
    googleLogin: "Google ile Giriş Yapıldı",
    decks: "Deck",
    flashcards: "Flashcard",
    quizzes: "Quiz",
    errorLoadingProfile: "Profil yüklenirken hata oluştu",
    
    // How It Works
    howItWorksTitle: "Nasıl Çalışır?",
    step1Title: "1. Deck Oluştur",
    step1Desc: "Öğrenmek istediğin konular için deck'ler oluştur. Her deck bir konu başlığıdır.",
    step2Title: "2. Flashcard Ekle",
    step2Desc: "Deck'ine flashcard'lar ekle. Her flashcard'ın ön yüzünde soru, arka yüzünde cevap olur.",
    step3Title: "3. Öğren",
    step3Desc: "Yeni flashcard'ları öğren. Her flashcard'ı doğru cevapladığında bir sonraki seviyeye geçersin.",
    step4Title: "4. Tekrar Et",
    step4Desc: "Spaced Repetition sistemi sayesinde öğrendiklerini zamanında tekrar ederek unutmayı önle.",
    step5Title: "5. Quiz Yap",
    step5Desc: "Öğrendiklerini test etmek için quiz'ler oluştur ve kendini sına.",
    previous: "Önceki",
    next: "Sonraki",
    readyToStart: "Hazırsan başlamak için giriş yap!",
    
    // Errors
    error: "Hata",
    errorOccurred: "Bir hata oluştu",
    notFound: "Bulunamadı",
  },
  en: {
    // Common
    home: "Home",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    add: "Add",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    
    // Navigation
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    profile: "My Profile",
    howItWorks: "How It Works?",
    
    // Landing
    landingDescription: "It is an easy to use, spaced repetition system that you have been waiting for!",
    
    // Sign In/Up
    email: "Email",
    password: "Password",
    enterEmail: "Enter your email...",
    enterPassword: "Enter your password...",
    signInTitle: "Sign In",
    signUpTitle: "Sign Up",
    or: "or",
    googleSignIn: "Sign in with Google",
    googleSignUp: "Sign up with Google",
    
    // Dashboard
    dashboard: "Dashboard",
    yourDecks: "Your Decks",
    yourQuizzes: "Your Quizzes",
    noDecksYet: "No decks yet. Create your first deck!",
    noQuizzesYet: "No quizzes yet. Create your first quiz!",
    
    // Sidebar
    dueToday: "Due today",
    learnNew: "Learn new",
    quiz: "Quiz",
    logOut: "Log out",
    loadingDecks: "Loading decks...",
    couldntLoadDecks: "Couldn't load decks :(",
    loadingQuizzes: "Loading quizzes...",
    couldntLoadQuizzes: "Couldn't load quizzes :(",
    
    // Deck
    cards: "cards",
    card: "card",
    studyDue: "Study due",
    retention: "retention",
    createNewDeck: "Create New Deck",
    deckName: "Deck Name",
    enterDeckName: "Enter deck name...",
    createDeck: "Create Deck",
    editDeckName: "Edit Deck Name",
    deckNameUpdated: "Deck name updated",
    deleteDeck: "Delete this deck?",
    deckDeleted: "Deck deleted successfully!",
    deckNotFound: "Deck not found",
    clickToEditName: "Click to edit name",
    
    // Flashcard
    front: "Front",
    back: "Back",
    addCard: "Add Card",
    editCard: "Edit Card",
    deleteCard: "Delete Card",
    deleteCardConfirm: "Are you sure you want to delete this card?",
    
    // Quiz
    quizzes: "Your quizzes",
    createQuiz: "Create Quiz",
    quizCreated: "Quiz created successfully!",
    creating: "Creating...",
    quizName: "Quiz Name",
    enterQuizName: "Enter quiz name...",
    createQuizButton: "Create Quiz",
    words: "words",
    word: "word",
    deleteQuiz: "Delete this quiz?",
    quizDeleted: "Quiz deleted successfully!",
    addWord: "Add Word",
    addWordFromFlashcard: "Add from Flashcard",
    bulkImport: "Bulk Import",
    startQuiz: "Start Quiz",
    wordLabel: "Word",
    definitionLabel: "Definition",
    enterWord: "Enter word...",
    enterDefinition: "Enter definition...",
    editQuizName: "Edit Quiz Name",
    editWord: "Edit Word",
    quizNameUpdated: "Quiz name updated",
    wordUpdated: "Word updated",
    wordAdded: "Word added successfully!",
    wordDeleted: "Word deleted successfully!",
    flashcardAdded: "Flashcard added to quiz",
    noFlashcardsYet: "No flashcards yet. Create a deck and add flashcards first.",
    wordsLabel: "Words",
    noWordsYet: "No words yet. Add words to get started!",
    clickToEdit: "Click to edit",
    editWordTitle: "Edit word",
    deleteWordTitle: "Delete word",
    bulkImportTitle: "Bulk Word Import",
    bulkImportInstructions: "Add multiple words using one of the following formats:",
    csvFormat: "CSV Format:",
    dashFormat: "Dash Format:",
    bulkImportPlaceholder: "Enter words here...\n\nExample:\napple,elma\nbanana,muz\norange,portakal",
    importWords: "Import Words",
    
    // Profile
    profileTitle: "My Profile",
    user: "User",
    statistics: "Statistics",
    accountInfo: "Account Information",
    membershipDate: "Membership Date:",
    loginMethod: "Login Method:",
    google: "Google",
    emailPassword: "Email/Password",
    unknown: "Unknown",
    googleLogin: "Signed in with Google",
    decks: "Decks",
    flashcards: "Flashcards",
    quizzes: "Quizzes",
    errorLoadingProfile: "Error loading profile",
    
    // How It Works
    howItWorksTitle: "How It Works?",
    step1Title: "1. Create Deck",
    step1Desc: "Create decks for topics you want to learn. Each deck is a topic heading.",
    step2Title: "2. Add Flashcard",
    step2Desc: "Add flashcards to your deck. Each flashcard has a question on the front and an answer on the back.",
    step3Title: "3. Learn",
    step3Desc: "Learn new flashcards. When you answer each flashcard correctly, you move to the next level.",
    step4Title: "4. Review",
    step4Desc: "Prevent forgetting by reviewing what you've learned in a timely manner thanks to the Spaced Repetition system.",
    step5Title: "5. Take Quiz",
    step5Desc: "Create quizzes to test what you've learned and challenge yourself.",
    previous: "Previous",
    next: "Next",
    readyToStart: "Ready to start? Sign in to begin!",
    
    // Errors
    error: "Error",
    errorOccurred: "An error occurred",
    notFound: "Not Found",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // localStorage'dan dil tercihini al, yoksa Türkçe varsayılan
    const savedLanguage = localStorage.getItem('appLanguage');
    return savedLanguage || 'tr';
  });

  useEffect(() => {
    // Dil değiştiğinde localStorage'a kaydet
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

