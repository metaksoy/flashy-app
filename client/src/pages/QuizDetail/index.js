import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import LoadingScreen from "../../common/components/LoadingScreen";
import Button from "../../common/components/Button";
import TextInput from "../../common/components/TextInput";
import Modal from "../../common/components/Modal";
import styles from "./QuizDetail.module.css";

const QuizDetail = () => {
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

  const { data, loading, error } = useQuery(GET_QUIZ, {
    variables: { id },
  });

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
    if (window.confirm("Bu kelimeyi silmek istediğinizden emin misiniz?")) {
      deleteQuizWord({ variables: { id: wordId } });
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
      <div className={styles.header}>
        <h1>{quiz.name}</h1>
        <div className={styles.actions}>
          <Button onClick={() => setShowAddWordModal(true)}>
            ➕ Kelime Ekle
          </Button>
          <Button onClick={() => setShowBulkImportModal(true)}>
            📥 Toplu İçe Aktar
          </Button>
          <Button onClick={showQuizTypeSelection} disabled={quiz.words.length === 0}>
            🎯 Quiz Başlat
          </Button>
        </div>
      </div>

      <div className={styles.wordsList}>
        <h2>Kelimeler ({quiz.words.length})</h2>
        {quiz.words.length === 0 ? (
          <p className={styles.emptyState}>Henüz kelime yok. Başlamak için kelime ekleyin!</p>
        ) : (
          <div className={styles.wordsGrid}>
            {quiz.words.map((word) => (
              <div key={word.id} className={styles.wordCard}>
                <div className={styles.wordContent}>
                  <h3>{word.word}</h3>
                  <p>{word.definition}</p>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteWord(word.id)}
                  title="Kelimeyi sil"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Word Modal */}
      <Modal open={showAddWordModal} setOpen={setShowAddWordModal}>
        <div className={styles.modalContent}>
          <h2>➕ Yeni Kelime Ekle</h2>
          <form onSubmit={handleAddWord}>
            <TextInput
              label="Kelime"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Kelimeyi girin..."
              required
            />
            <TextInput
              label="Tanım"
              value={newDefinition}
              onChange={(e) => setNewDefinition(e.target.value)}
              placeholder="Tanımı girin..."
              required
            />
            <div className={styles.modalActions}>
              <Button
                type="button"
                onClick={() => setShowAddWordModal(false)}
                style={{ background: "#6c757d" }}
              >
                İptal
              </Button>
              <Button type="submit">Kelime Ekle</Button>
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
                  onClick={() => {
                    if (window.confirm("Quiz'den çıkmak istediğinize emin misiniz? İlerlemeniz kaybolacak.")) {
                      setShowQuizModal(false);
                      setQuizStarted(false);
                    }
                  }}
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
          
          <div className={styles.quizQuestion}>
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
                                }}
                                onFocus={(e) => {
                                  e.target.blur();
                                }}
                                disabled={showAnswer}
                                type="button"
                                tabIndex={showAnswer ? -1 : 0}
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
          <h2>📥 Toplu Kelime İçe Aktarma</h2>
          <p className={styles.importInstructions}>
            Aşağıdaki formatlardan birini kullanarak birden fazla kelime ekleyin:
          </p>
          <div className={styles.formatExamples}>
            <div className={styles.example}>
              <strong>CSV Formatı:</strong>
              <pre>apple,elma
banana,muz
orange,portakal</pre>
            </div>
            <div className={styles.example}>
              <strong>Tire Formatı:</strong>
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
              placeholder="Kelimeleri buraya girin...&#10;&#10;Örnek:&#10;apple,elma&#10;banana,muz&#10;orange,portakal"
              rows={10}
              required
            />
            <div className={styles.modalActions}>
              <Button
                type="button"
                onClick={() => setShowBulkImportModal(false)}
                style={{ backgroundColor: '#6c757d' }}
              >
                İptal
              </Button>
              <Button type="submit" disabled={!bulkText.trim()}>
                Kelimeleri İçe Aktar
              </Button>
            </div>
          </form>
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
