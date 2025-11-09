import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import LoadingScreen from "../../common/components/LoadingScreen";
import Button from "../../common/components/Button";
import TextInput from "../../common/components/TextInput";
import Modal from "../../common/components/Modal";
import { useTranslation } from "../../contexts/LanguageContext";
import styles from "./QuizDetail.module.css";

const QuizDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [quizType, setQuizType] = useState("text"); // "text" or "multiple"
  const [showQuizTypeModal, setShowQuizTypeModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(null); // Seçilen soru sayısı
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false); // Quiz'den çıkış onayı
  const [wordToDelete, setWordToDelete] = useState(null);
  const [showDeleteWordModal, setShowDeleteWordModal] = useState(false);
  const [showEditQuizNameModal, setShowEditQuizNameModal] = useState(false);
  const [editQuizName, setEditQuizName] = useState("");
  const [showEditWordModal, setShowEditWordModal] = useState(false);
  const [editWord, setEditWord] = useState({ id: "", word: "", definition: "" });
  const [showAddFlashcardModal, setShowAddFlashcardModal] = useState(false);
  
  // Quiz karışık sorular ve yanlış cevaplar için yeni state'ler
  const [shuffledWords, setShuffledWords] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [questionQueue, setQuestionQueue] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  // Yeni interaktif özellikler için state'ler
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const GET_QUIZ = gql`
    query getQuiz($id: ID!) {
      quiz(id: $id) {
        id
        name
        words {
          id
          word
          definition
        }
      }
    }
  `;

  const CREATE_QUIZ_WORD = gql`
    mutation createQuizWord($data: CreateQuizWordInput!) {
      createQuizWord(data: $data) {
        id
        word
        definition
      }
    }
  `;

  const DELETE_QUIZ_WORD = gql`
    mutation deleteQuizWord($id: ID!) {
      deleteQuizWord(id: $id) {
        id
      }
    }
  `;

  const UPDATE_QUIZ = gql`
    mutation updateQuiz($id: ID!, $name: String!) {
      updateQuiz(id: $id, name: $name) {
        id
        name
      }
    }
  `;

  const UPDATE_QUIZ_WORD = gql`
    mutation updateQuizWord($id: ID!, $word: String, $definition: String) {
      updateQuizWord(id: $id, word: $word, definition: $definition) {
        id
        word
        definition
      }
    }
  `;

  const ADD_FLASHCARD_TO_QUIZ = gql`
    mutation addFlashcardToQuiz($flashcardId: ID!, $quizId: ID!) {
      addFlashcardToQuiz(flashcardId: $flashcardId, quizId: $quizId) {
        id
        word
        definition
      }
    }
  `;

  const GET_USER_FLASHCARDS = gql`
    query getUserFlashcards {
      user {
        decks {
          id
          name
          flashcards {
            id
            front
            back
          }
        }
      }
    }
  `;

  const { data, loading, error } = useQuery(GET_QUIZ, {
    variables: { id },
  });

  const { data: flashcardsData } = useQuery(GET_USER_FLASHCARDS);

  const [updateQuiz] = useMutation(UPDATE_QUIZ, {
    refetchQueries: [{ query: GET_QUIZ, variables: { id } }],
    onCompleted: () => {
      toast.success("Quiz ismi güncellendi");
      setShowEditQuizNameModal(false);
      setEditQuizName("");
    },
  });

  const [updateQuizWord] = useMutation(UPDATE_QUIZ_WORD, {
    refetchQueries: [{ query: GET_QUIZ, variables: { id } }],
    onCompleted: () => {
      toast.success("Kelime güncellendi");
      setShowEditWordModal(false);
      setEditWord({ id: "", word: "", definition: "" });
    },
  });

  const [addFlashcardToQuiz] = useMutation(ADD_FLASHCARD_TO_QUIZ, {
    refetchQueries: [{ query: GET_QUIZ, variables: { id } }],
    onCompleted: () => {
      toast.success("Flashcard quiz'e eklendi");
      setShowAddFlashcardModal(false);
    },
  });

  // Her soru değişiminde focus'u temizle
  useEffect(() => {
    if (quizStarted && !showAnswer) {
      // Aktif elementi blur yap
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
      // Tüm butonların focus'unu kaldır
      const buttons = document.querySelectorAll('button[type="button"]');
      buttons.forEach(btn => {
        if (btn.blur) btn.blur();
      });
      // Quiz question div'ine focus yap
      setTimeout(() => {
        const quizQuestion = document.querySelector('[tabIndex="-1"]');
        if (quizQuestion && quizQuestion.focus) {
          quizQuestion.focus();
          // Hemen blur yap ki hiçbir şey focuslu kalmasın
          setTimeout(() => quizQuestion.blur(), 50);
        }
      }, 50);
    }
  }, [currentWordIndex, quizStarted, showAnswer]);

  const [createQuizWord] = useMutation(CREATE_QUIZ_WORD, {
    refetchQueries: [{ query: GET_QUIZ, variables: { id } }],
    onCompleted: () => {
      toast.success("✅ Kelime başarıyla eklendi!");
      setShowAddWordModal(false);
    },
    onError: (error) => {
      toast.error("❌ Kelime eklenemedi: " + error.message);
    },
  });

  const [deleteQuizWord] = useMutation(DELETE_QUIZ_WORD, {
    refetchQueries: [{ query: GET_QUIZ, variables: { id } }],
    onCompleted: () => {
      toast.success("✅ Kelime başarıyla silindi!");
    },
    onError: (error) => {
      toast.error("❌ Kelime silinemedi: " + error.message);
    },
  });

  if (loading) return <LoadingScreen fullscreen={true} />;
  if (error) return <p>Quiz yüklenirken hata oluştu :(</p>;
  if (!data.quiz) return <p>Quiz bulunamadı</p>;

  const { quiz } = data;

  const handleAddWord = (e) => {
    e.preventDefault();
    console.log("Adding word:", newWord, "definition:", newDefinition);
    
    if (newWord.trim() && newDefinition.trim()) {
      createQuizWord({
        variables: {
          data: {
            word: newWord.trim(),
            definition: newDefinition.trim(),
            quizId: id,
          },
        },
      });
      setNewWord("");
      setNewDefinition("");
    }
  };

  const handleDeleteWord = (wordId) => {
    setWordToDelete(wordId);
    setShowDeleteWordModal(true);
  };

  const confirmDeleteWord = () => {
    if (wordToDelete) {
      deleteQuizWord({ variables: { id: wordToDelete } });
      setShowDeleteWordModal(false);
      setWordToDelete(null);
    }
  };

  const handleBulkImport = (e) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      toast.error("Lütfen kelime girin!");
      return;
    }

    const lines = bulkText.trim().split('\n').filter(line => line.trim());
    const words = [];
    let successCount = 0;
    let errorCount = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // CSV format: word,definition
      if (trimmedLine.includes(',')) {
        const parts = trimmedLine.split(',').map(part => part.trim());
        if (parts.length >= 2) {
          words.push({
            word: parts[0],
            definition: parts.slice(1).join(',').trim()
          });
        } else {
          errorCount++;
        }
      } else {
        // Single word format: word - definition
        const dashIndex = trimmedLine.indexOf(' - ');
        if (dashIndex > 0) {
          words.push({
            word: trimmedLine.substring(0, dashIndex).trim(),
            definition: trimmedLine.substring(dashIndex + 3).trim()
          });
        } else {
          errorCount++;
        }
      }
    });

    if (words.length === 0) {
      toast.error("Geçerli kelime bulunamadı! Format: 'kelime,tanım' veya 'kelime - tanım'");
      return;
    }

    // Add words one by one
    let completed = 0;
    words.forEach((wordData, index) => {
      createQuizWord({
        variables: {
          data: {
            word: wordData.word,
            definition: wordData.definition,
            quizId: id,
          },
        },
      }).then(() => {
        completed++;
        if (completed === words.length) {
          toast.success(`✅ ${words.length} kelime başarıyla eklendi!`);
          setBulkText("");
          setShowBulkImportModal(false);
        }
      }).catch((error) => {
        errorCount++;
        if (completed + errorCount === words.length) {
          if (errorCount > 0) {
            toast.warning(`⚠️ ${words.length - errorCount} kelime eklendi, ${errorCount} başarısız oldu`);
          }
          setBulkText("");
          setShowBulkImportModal(false);
        }
      });
    });
  };

  // Kelimeleri karıştırma fonksiyonu
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Quiz başlatma fonksiyonu - karışık sorular
  const startQuiz = (questionCount = null) => {
    if (quiz.words.length === 0) {
      toast.error("Önce quiz'e kelime ekleyin!");
      return;
    }
    if (quizType === "multiple" && quiz.words.length < 4) {
      toast.error("Çoktan seçmeli quiz için en az 4 kelime gerekli!");
      return;
    }
    
    // Kelimeleri karıştır
    const shuffled = shuffleArray(quiz.words);
    
    // Soru sayısını belirle
    const finalQuestionCount = questionCount || selectedQuestionCount || shuffled.length;
    const selectedWords = shuffled.slice(0, Math.min(finalQuestionCount, shuffled.length));
    
    setShuffledWords(selectedWords);
    setQuestionQueue([...selectedWords]);
    setWrongAnswers([]);
    setTotalQuestions(selectedWords.length);
    
    setQuizStarted(true);
    setShowQuizModal(true);
    setCurrentWordIndex(0);
    setScore(0);
    setUserAnswer("");
    setShowAnswer(false);
    setQuizCompleted(false);
    setAnswerHistory([]);
    setStartTime(Date.now());
    setEndTime(null);
    setIsAnswerCorrect(null);
    setSelectedOption(null);
  };

  const showQuizTypeSelection = () => {
    if (quiz.words.length === 0) {
      toast.error("Önce quiz'e kelime ekleyin!");
      return;
    }
    // Varsayılan olarak tüm kelimeleri seç
    setSelectedQuestionCount(quiz.words.length);
    setShowQuizTypeModal(true);
  };

  const generateMultipleChoiceOptions = (correctWord, allWords) => {
    console.log("Generating options for:", correctWord, "from", allWords);
    try {
      const options = [correctWord];
      const otherWords = allWords.filter(word => word.word !== correctWord);
      
      // Shuffle and take 3 random options
      const shuffled = otherWords.sort(() => 0.5 - Math.random());
      options.push(...shuffled.slice(0, 3));
      
      // Shuffle the final options and extract only word strings
      const finalOptions = options.sort(() => 0.5 - Math.random()).map(option => 
        typeof option === 'string' ? option : option.word
      );
      console.log("Generated options:", finalOptions);
      return finalOptions;
    } catch (error) {
      console.error("Error generating options:", error);
      return [correctWord, "Option 1", "Option 2", "Option 3"];
    }
  };

  const checkAnswer = (selectedAnswer = null) => {
    console.log("checkAnswer called with:", { selectedAnswer, userAnswer, currentWordIndex });
    
    const currentWord = questionQueue[currentWordIndex];
    if (!currentWord) {
      console.error("No current word found");
      return;
    }
    
    // Eğer selectedAnswer bir event objesi ise, userAnswer'ı kullan
    let answerToCheck = selectedAnswer;
    if (selectedAnswer && typeof selectedAnswer === 'object' && selectedAnswer.type === 'click') {
      answerToCheck = userAnswer;
    }
    
    // Eğer selectedAnswer null/undefined ise userAnswer'ı kullan
    if (!answerToCheck) {
      answerToCheck = userAnswer;
    }
    
    console.log("Answer to check:", answerToCheck, "Type:", typeof answerToCheck);
    
    // String kontrolü ve güvenli karşılaştırma
    if (!answerToCheck || typeof answerToCheck !== 'string') {
      console.error("Invalid answer:", answerToCheck);
      toast.error("Lütfen bir cevap girin!");
      return;
    }
    
    const normalizedUserAnswer = answerToCheck.toLowerCase().trim();
    const normalizedCorrectAnswer = currentWord.word.toLowerCase().trim();
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    
    console.log("Comparison:", { normalizedUserAnswer, normalizedCorrectAnswer, isCorrect });
    
    // Cevap geçmişine ekle
    setAnswerHistory(prev => [...prev, {
      word: currentWord.word,
      definition: currentWord.definition,
      userAnswer: answerToCheck,
      isCorrect: isCorrect,
      questionNumber: currentWordIndex + 1
    }]);
    
    setIsAnswerCorrect(isCorrect);
    setSelectedOption(answerToCheck);
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    } else {
      // Yanlış cevaplanan kelimeyi yanlış cevaplar listesine ekle
      setWrongAnswers(prev => [...prev, currentWord]);
    }
    
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    // Önce state'leri sıfırla
    setShowAnswer(false);
    setUserAnswer("");
    setIsAnswerCorrect(null);
    setSelectedOption(null);
    
    if (currentWordIndex < questionQueue.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // İlk tur tamamlandı, yanlış cevapları kontrol et
      if (wrongAnswers.length > 0) {
        // Yanlış cevaplanan kelimeleri 3 soru sonra tekrar sor
        const newQueue = [...questionQueue];
        
        // Yanlış cevaplanan kelimeleri kuyruğa ekle (3 soru sonra)
        wrongAnswers.forEach((wrongWord, index) => {
          const insertIndex = Math.min(questionQueue.length + 3 + index, newQueue.length);
          newQueue.splice(insertIndex, 0, wrongWord);
        });
        
        setQuestionQueue(newQueue);
        setWrongAnswers([]);
        setCurrentWordIndex(currentWordIndex + 1);
        
        toast.info(`İlk tur tamamlandı! Şimdi yanlış yaptığınız ${wrongAnswers.length} kelimeyi tekrar ediyoruz...`);
      } else {
        // Quiz tamamen bitti
        setEndTime(Date.now());
        setQuizCompleted(true);
      }
    }
  };
  
  const restartQuiz = () => {
    setQuizCompleted(false);
    setShowQuizModal(false);
    setQuizStarted(false);
  };
  
  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentWord = questionQueue[currentWordIndex];

  return (
    <div className={styles.container}>
      {/* Edit Quiz Name Modal */}
      <Modal open={showEditQuizNameModal} setOpen={setShowEditQuizNameModal}>
        <div className={styles.modalContent}>
          <h2>{t("editQuizName")}</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editQuizName.trim()) {
              updateQuiz({ variables: { id: quiz.id, name: editQuizName.trim() } });
            }
          }}>
            <TextInput
              label={t("quizName")}
              value={editQuizName}
              onChange={(e) => setEditQuizName(e.target.value)}
              placeholder={t("enterQuizName")}
              required
            />
            <div className={styles.modalActions}>
              <Button
                type="button"
                onClick={() => {
                  setShowEditQuizNameModal(false);
                  setEditQuizName("");
                }}
                style={{ background: "#6c757d" }}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={!editQuizName.trim()}>
                {t("save")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Edit Word Modal */}
      <Modal open={showEditWordModal} setOpen={setShowEditWordModal}>
        <div className={styles.modalContent}>
          <h2>{t("editWord")}</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editWord.word.trim() && editWord.definition.trim()) {
              updateQuizWord({
                variables: {
                  id: editWord.id,
                  word: editWord.word.trim(),
                  definition: editWord.definition.trim(),
                },
              });
            }
          }}>
            <TextInput
              label={t("wordLabel")}
              value={editWord.word}
              onChange={(e) => setEditWord({ ...editWord, word: e.target.value })}
              placeholder={t("enterWord")}
              required
            />
            <TextInput
              label={t("definitionLabel")}
              value={editWord.definition}
              onChange={(e) => setEditWord({ ...editWord, definition: e.target.value })}
              placeholder={t("enterDefinition")}
              required
            />
            <div className={styles.modalActions}>
              <Button
                type="button"
                onClick={() => {
                  setShowEditWordModal(false);
                  setEditWord({ id: "", word: "", definition: "" });
                }}
                style={{ background: "#6c757d" }}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={!editWord.word.trim() || !editWord.definition.trim()}>
                {t("save")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Add Flashcard to Quiz Modal */}
      <Modal open={showAddFlashcardModal} setOpen={setShowAddFlashcardModal}>
        <div className={styles.modalContent}>
          <h2>{t("addWordFromFlashcard")}</h2>
          {flashcardsData?.user?.decks?.length === 0 ? (
            <p>{t("noFlashcardsYet")}</p>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {flashcardsData?.user?.decks?.map((deck) => (
                deck.flashcards?.length > 0 && (
                  <div key={deck.id} style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ marginBottom: "0.5rem", color: "#333" }}>{deck.name}</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {deck.flashcards.map((flashcard) => (
                        <div
                          key={flashcard.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem",
                            border: "1px solid #ddd",
                            borderRadius: "0.25rem",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            addFlashcardToQuiz({
                              variables: {
                                flashcardId: flashcard.id,
                                quizId: id,
                              },
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f5f5f5";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "white";
                          }}
                        >
                          <div>
                            <strong>{flashcard.front}</strong> - {flashcard.back}
                          </div>
                          <Button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addFlashcardToQuiz({
                                variables: {
                                  flashcardId: flashcard.id,
                                  quizId: id,
                                },
                              });
                            }}
                            style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
                          >
                            {t("add")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
          <div className={styles.modalActions} style={{ marginTop: "1rem" }}>
            <Button
              type="button"
              onClick={() => setShowAddFlashcardModal(false)}
              style={{ background: "#6c757d" }}
            >
              {t("close")}
            </Button>
          </div>
        </div>
      </Modal>

      <div className={styles.header}>
        <h1
          onClick={() => {
            setEditQuizName(quiz.name);
            setShowEditQuizNameModal(true);
          }}
          style={{ cursor: "pointer", textDecoration: "underline" }}
          title={t("clickToEditName")}
        >
          {quiz.name}
        </h1>
        <div className={styles.actions}>
          <Button onClick={() => setShowAddWordModal(true)}>
            ➕ {t("addWord")}
          </Button>
          <Button onClick={() => setShowAddFlashcardModal(true)}>
            📚 {t("addWordFromFlashcard")}
          </Button>
          <Button onClick={() => setShowBulkImportModal(true)}>
            📥 {t("bulkImport")}
          </Button>
          <Button onClick={showQuizTypeSelection} disabled={quiz.words.length === 0}>
            🎯 {t("startQuiz")}
          </Button>
        </div>
      </div>

      <div className={styles.wordsList}>
        <h2>{t("wordsLabel")} ({quiz.words.length})</h2>
        {quiz.words.length === 0 ? (
          <p className={styles.emptyState}>{t("noWordsYet")}</p>
        ) : (
          <div className={styles.wordsGrid}>
            {quiz.words.map((word) => (
              <div key={word.id} className={styles.wordCard}>
                <div 
                  className={styles.wordContent}
                  onClick={() => {
                    setEditWord({ id: word.id, word: word.word, definition: word.definition });
                    setShowEditWordModal(true);
                  }}
                  style={{ cursor: "pointer" }}
                  title={t("clickToEdit")}
                >
                  <h3>{word.word}</h3>
                  <p>{word.definition}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => {
                      setEditWord({ id: word.id, word: word.word, definition: word.definition });
                      setShowEditWordModal(true);
                    }}
                    title={t("editWordTitle")}
                    style={{ background: "#4285F4", color: "white", border: "none" }}
                  >
                    ✏️
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteWord(word.id)}
                    title={t("deleteWordTitle")}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Word Modal */}
      <Modal open={showAddWordModal} setOpen={setShowAddWordModal}>
        <div className={styles.modalContent}>
          <h2>➕ {t("addWord")}</h2>
          <form onSubmit={handleAddWord}>
            <TextInput
              label={t("wordLabel")}
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder={t("enterWord")}
              required
            />
            <TextInput
              label={t("definitionLabel")}
              value={newDefinition}
              onChange={(e) => setNewDefinition(e.target.value)}
              placeholder={t("enterDefinition")}
              required
            />
            <div className={styles.modalActions}>
              <Button
                type="button"
                onClick={() => setShowAddWordModal(false)}
                style={{ background: "#6c757d" }}
              >
                {t("cancel")}
              </Button>
              <Button type="submit">{t("addWord")}</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Quiz Modal */}
      <Modal open={showQuizModal} setOpen={setShowQuizModal} fullscreen={true}>
        <div className={styles.quizModalContent}>
          {!quizCompleted ? (
            <>
              <div className={styles.quizHeader}>
                <h2>📝 {quiz.name}</h2>
                <button 
                  className={styles.closeQuizBtn}
                  onClick={() => setShowExitConfirmModal(true)}
                >
                  ✕
                </button>
              </div>

              {/* Progress Bar */}
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBar}
                  style={{ width: `${((currentWordIndex) / questionQueue.length) * 100}%` }}
                />
              </div>

          <div className={styles.quizProgress}>
                <div className={styles.progressInfo}>
                  <span className={styles.questionNumber}>
                    Soru {currentWordIndex + 1} / {questionQueue.length}
                  </span>
                  <span className={styles.score}>
                    🎯 Skor: {score}/{totalQuestions}
                  </span>
                </div>
            {wrongAnswers.length > 0 && (
                  <div className={styles.wrongAnswersInfo}>
                    ⚠️ Tekrar edilecek: {wrongAnswers.length} kelime
                  </div>
            )}
          </div>
          
              <div className={styles.quizQuestion} tabIndex={-1}>
                <h3>Bu tanımın karşılığı nedir?</h3>
                <p className={styles.definition}>
                  <span className={styles.quoteIcon}>"</span>
                  {currentWord?.definition}
                  <span className={styles.quoteIcon}>"</span>
                </p>
            
            {!showAnswer ? (
              <div className={styles.answerInput}>
                {quizType === "text" ? (
                  <>
                    <div className={styles.quizInputContainer}>
                      <TextInput
                            label="Cevabınız"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Cevabınızı yazın..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && userAnswer.trim()) {
                                checkAnswer();
                              }
                            }}
                      />
                    </div>
                        <Button 
                          onClick={() => checkAnswer()} 
                          disabled={!userAnswer.trim()}
                          style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                        >
                          ✓ Cevabı Kontrol Et
                    </Button>
                  </>
                ) : (
                  <div className={styles.multipleChoice}>
                        <h4>Doğru cevabı seçin:</h4>
                    <div className={styles.optionsGrid}>
                      {(() => {
                        console.log("Rendering multiple choice for word:", currentWord?.word);
                        const options = generateMultipleChoiceOptions(currentWord?.word, quiz.words);
                        console.log("Options to render:", options);
                        return options.map((option, index) => (
                          <button
                                key={`${currentWordIndex}-${option}-${index}`}
                                className={`${styles.optionButton} ${
                                  selectedOption === option 
                                    ? isAnswerCorrect 
                                      ? styles.correctOption 
                                      : styles.wrongOption
                                    : ''
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!showAnswer) {
                                    checkAnswer(option);
                                  }
                                  // Tıklamadan sonra hemen blur yap
                                  e.currentTarget.blur();
                                }}
                                onTouchStart={(e) => {
                                  // Touch başladığında blur yap
                                  e.currentTarget.blur();
                                }}
                                onFocus={(e) => {
                                  e.preventDefault();
                                  e.target.blur();
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                }}
                                disabled={showAnswer}
                                type="button"
                                tabIndex={-1}
                                autoFocus={false}
                          >
                            {option}
                          </button>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
                  <div className={`${styles.answerResult} ${isAnswerCorrect ? styles.correctResult : styles.wrongResult}`}>
                    <div className={styles.resultIcon}>
                      {isAnswerCorrect ? '✅' : '❌'}
                    </div>
                    <p className={styles.resultMessage}>
                      {isAnswerCorrect ? 'Harika! Doğru cevap!' : 'Yanlış cevap!'}
                    </p>
                    {!isAnswerCorrect && selectedOption && (
                      <p className={styles.userWrongAnswerDisplay}>
                        Sizin cevabınız: <strong className={styles.wrongAnswerText}>{selectedOption}</strong>
                      </p>
                    )}
                <p className={styles.correctAnswer}>
                      Doğru cevap: <strong>{currentWord?.word}</strong>
                    </p>
                    <Button 
                      onClick={nextQuestion}
                      style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                    >
                      {currentWordIndex < questionQueue.length - 1 ? '▶ Sonraki Soru' : '🏁 Quiz\'i Bitir'}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Quiz Tamamlandı - Sonuç Ekranı
            <div className={styles.resultsScreen}>
              <div className={styles.resultsHeader}>
                <div className={styles.resultsIcon}>
                  {(score / totalQuestions) >= 0.8 ? '🏆' : 
                   (score / totalQuestions) >= 0.6 ? '🎉' : 
                   (score / totalQuestions) >= 0.4 ? '👍' : '📚'}
                </div>
                <h2>Quiz Tamamlandı!</h2>
              </div>

              <div className={styles.resultsStats}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{score}</div>
                  <div className={styles.statLabel}>Doğru Cevap</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{totalQuestions - score}</div>
                  <div className={styles.statLabel}>Yanlış Cevap</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {Math.round((score / totalQuestions) * 100)}%
                  </div>
                  <div className={styles.statLabel}>Başarı Oranı</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {formatTime(endTime - startTime)}
                  </div>
                  <div className={styles.statLabel}>Süre</div>
                </div>
              </div>

              <div className={styles.performanceMessage}>
                {(score / totalQuestions) >= 0.8 ? (
                  <p>🌟 Mükemmel! Harika bir performans sergiledi!</p>
                ) : (score / totalQuestions) >= 0.6 ? (
                  <p>🎯 İyi iş çıkardınız! Biraz daha pratikle mükemmel olacaksınız.</p>
                ) : (score / totalQuestions) >= 0.4 ? (
                  <p>💪 Fena değil! Daha fazla pratik yaparsanız çok daha iyi olacaksınız.</p>
                ) : (
                  <p>📖 Daha fazla çalışmaya ihtiyacınız var. Tekrar deneyin!</p>
                )}
              </div>

              {/* Cevap Geçmişi */}
              <div className={styles.answerHistorySection}>
                <h3>📋 Cevap Detayları</h3>
                <div className={styles.answerHistoryList}>
                  {answerHistory.map((answer, index) => (
                    <div 
                      key={index} 
                      className={`${styles.historyItem} ${answer.isCorrect ? styles.historyCorrect : styles.historyWrong}`}
                    >
                      <div className={styles.historyIcon}>
                        {answer.isCorrect ? '✅' : '❌'}
                      </div>
                      <div className={styles.historyContent}>
                        <div className={styles.historyQuestion}>
                          <strong>Soru {answer.questionNumber}:</strong> {answer.definition}
                        </div>
                        <div className={styles.historyAnswer}>
                          {!answer.isCorrect && (
                            <span className={styles.userWrongAnswer}>
                              Sizin cevabınız: "{answer.userAnswer}"
                            </span>
                          )}
                          <span className={styles.correctAnswerLabel}>
                            Doğru cevap: <strong>{answer.word}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.resultsActions}>
                <Button 
                  onClick={restartQuiz}
                  style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                >
                  🏠 Ana Sayfaya Dön
                </Button>
                <Button 
                  onClick={() => {
                    setQuizCompleted(false);
                    setShowQuizModal(false);
                    setQuizStarted(false);
                    setSelectedQuestionCount(quiz.words.length);
                    setTimeout(() => {
                      setShowQuizTypeModal(true);
                    }, 100);
                  }}
                  style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                >
                  🔄 Tekrar Dene
                </Button>
              </div>
              </div>
            )}
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal open={showBulkImportModal} setOpen={setShowBulkImportModal}>
        <div className={styles.modalContent}>
          <h2>📥 {t("bulkImportTitle")}</h2>
          <p className={styles.importInstructions}>
            {t("bulkImportInstructions")}
          </p>
          <div className={styles.formatExamples}>
            <div className={styles.example}>
              <strong>{t("csvFormat")}</strong>
              <pre>apple,elma
banana,muz
orange,portakal</pre>
            </div>
            <div className={styles.example}>
              <strong>{t("dashFormat")}</strong>
              <pre>apple - elma
banana - muz
orange - portakal</pre>
            </div>
          </div>
          <form onSubmit={handleBulkImport}>
            <textarea
              className={styles.bulkTextarea}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={t("bulkImportPlaceholder")}
              rows={10}
              required
            />
            <div className={styles.modalActions}>
              <Button
                type="button"
                onClick={() => setShowBulkImportModal(false)}
                style={{ backgroundColor: '#6c757d' }}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={!bulkText.trim()}>
                {t("importWords")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Exit Confirmation Modal */}
      <Modal open={showExitConfirmModal} setOpen={setShowExitConfirmModal}>
        <div className={styles.modalContent}>
          <div className={styles.confirmModalHeader}>
            <div className={styles.confirmIcon}>⚠️</div>
            <h2>Quiz'den Çıkmak İstediğinize Emin Misiniz?</h2>
          </div>
          <p className={styles.confirmMessage}>
            Quiz'den çıkarsanız ilerlemeniz kaybolacak ve puanınız kaydedilmeyecek.
          </p>
          <div className={styles.modalActions}>
            <Button
              type="button"
              onClick={() => setShowExitConfirmModal(false)}
              style={{ background: "#6c757d" }}
            >
              ❌ Hayır, Devam Et
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowExitConfirmModal(false);
                setShowQuizModal(false);
                setQuizStarted(false);
              }}
              style={{ background: "#dc3545" }}
            >
              ✓ Evet, Çık
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Word Confirmation Modal */}
      <Modal open={showDeleteWordModal} setOpen={setShowDeleteWordModal}>
        <div className={styles.modalContent}>
          <div className={styles.confirmModalHeader}>
            <div className={styles.confirmIcon}>🗑️</div>
            <h2>Kelimeyi Silmek İstediğinize Emin Misiniz?</h2>
          </div>
          <p className={styles.confirmMessage}>
            Bu işlem geri alınamaz.
          </p>
          <div className={styles.modalActions}>
            <Button
              type="button"
              onClick={() => {
                setShowDeleteWordModal(false);
                setWordToDelete(null);
              }}
              style={{ background: "#6c757d" }}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={confirmDeleteWord}
              style={{ background: "#dc3545" }}
            >
              Evet, Sil
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quiz Type Selection Modal */}
      <Modal open={showQuizTypeModal} setOpen={setShowQuizTypeModal}>
        <div className={styles.modalContent}>
          <h2>🎯 Quiz Ayarları</h2>
          
          {/* Quiz Type Selection */}
          <div className={styles.settingSection}>
            <h3>Quiz Türü</h3>
          <div className={styles.quizTypeOptions}>
            <div 
                className={`${styles.quizTypeCard} ${quizType === "text" ? styles.selectedCard : ''}`}
                onClick={() => setQuizType("text")}
              >
                <div className={styles.cardIcon}>✍️</div>
                <h4>Yazarak Cevapla</h4>
                <p>Cevabı klavyeden yazın</p>
              </div>
              <div 
                className={`${styles.quizTypeCard} ${quizType === "multiple" ? styles.selectedCard : ''}`}
                onClick={() => setQuizType("multiple")}
              >
                <div className={styles.cardIcon}>☑️</div>
                <h4>Çoktan Seçmeli</h4>
                <p>4 seçenekten birini seçin</p>
              </div>
            </div>
          </div>

          {/* Question Count Selection */}
          <div className={styles.settingSection}>
            <h3>Soru Sayısı <span className={styles.totalWords}>(Toplam: {quiz.words.length} kelime)</span></h3>
            <div className={styles.questionCountOptions}>
              {[5, 10, 15, 20, 25, 30].map((count) => 
                count <= quiz.words.length ? (
                  <button
                    key={count}
                    className={`${styles.countButton} ${selectedQuestionCount === count ? styles.selectedCount : ''}`}
                    onClick={() => setSelectedQuestionCount(count)}
                  >
                    {count}
                  </button>
                ) : null
              )}
              <button
                className={`${styles.countButton} ${selectedQuestionCount === quiz.words.length ? styles.selectedCount : ''}`}
                onClick={() => setSelectedQuestionCount(quiz.words.length)}
              >
                Tümü ({quiz.words.length})
              </button>
            </div>
          </div>

          {/* Start Quiz Button */}
          <div className={styles.modalActions}>
            <Button
              type="button"
              onClick={() => {
                setShowQuizTypeModal(false);
                setSelectedQuestionCount(null);
              }}
              style={{ background: "#6c757d" }}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowQuizTypeModal(false);
                startQuiz(selectedQuestionCount);
              }}
              disabled={!selectedQuestionCount}
            >
              Quiz'i Başlat
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizDetail;
