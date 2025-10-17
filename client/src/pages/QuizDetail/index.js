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
  
  // Quiz karışık sorular ve yanlış cevaplar için yeni state'ler
  const [shuffledWords, setShuffledWords] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [questionQueue, setQuestionQueue] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

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
      toast.success("Word added successfully!");
      setShowAddWordModal(false);
    },
    onError: (error) => {
      toast.error("Failed to add word: " + error.message);
    },
  });

  const [deleteQuizWord] = useMutation(DELETE_QUIZ_WORD, {
    refetchQueries: [{ query: GET_QUIZ, variables: { id } }],
    onCompleted: () => {
      toast.success("Word deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete word: " + error.message);
    },
  });

  if (loading) return <LoadingScreen fullscreen={true} />;
  if (error) return <p>Error loading quiz :(</p>;
  if (!data.quiz) return <p>Quiz not found</p>;

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
    if (window.confirm("Are you sure you want to delete this word?")) {
      deleteQuizWord({ variables: { id: wordId } });
    }
  };

  const handleBulkImport = (e) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      toast.error("Please enter some words!");
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
      toast.error("No valid words found! Use format: 'word,definition' or 'word - definition'");
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
          toast.success(`Successfully added ${words.length} words!`);
          setBulkText("");
          setShowBulkImportModal(false);
        }
      }).catch((error) => {
        errorCount++;
        if (completed + errorCount === words.length) {
          if (errorCount > 0) {
            toast.warning(`Added ${words.length - errorCount} words, ${errorCount} failed`);
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
  const startQuiz = () => {
    if (quiz.words.length === 0) {
      toast.error("Add some words to the quiz first!");
      return;
    }
    if (quizType === "multiple" && quiz.words.length < 4) {
      toast.error("Quiz needs at least 4 words for multiple choice!");
      return;
    }
    
    // Kelimeleri karıştır
    const shuffled = shuffleArray(quiz.words);
    setShuffledWords(shuffled);
    setQuestionQueue([...shuffled]);
    setWrongAnswers([]);
    setTotalQuestions(shuffled.length);
    
    setQuizStarted(true);
    setShowQuizModal(true);
    setCurrentWordIndex(0);
    setScore(0);
    setUserAnswer("");
    setShowAnswer(false);
  };

  const showQuizTypeSelection = () => {
    if (quiz.words.length === 0) {
      toast.error("Add some words to the quiz first!");
      return;
    }
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
      toast.error("Please enter an answer!");
      return;
    }
    
    const normalizedUserAnswer = answerToCheck.toLowerCase().trim();
    const normalizedCorrectAnswer = currentWord.word.toLowerCase().trim();
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    
    console.log("Comparison:", { normalizedUserAnswer, normalizedCorrectAnswer, isCorrect });
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      toast.success("Correct!");
    } else {
      toast.error(`Wrong! The answer is: ${currentWord.word}`);
      // Yanlış cevaplanan kelimeyi yanlış cevaplar listesine ekle
      setWrongAnswers(prev => [...prev, currentWord]);
    }
    
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    if (currentWordIndex < questionQueue.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserAnswer("");
      setShowAnswer(false);
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
        setUserAnswer("");
        setShowAnswer(false);
        
        toast.info(`First round completed! Now reviewing ${wrongAnswers.length} words you got wrong...`);
      } else {
        // Quiz tamamen bitti
        setShowQuizModal(false);
        setQuizStarted(false);
        toast.success(`Quiz completed! Your score: ${score}/${totalQuestions}`);
      }
    }
  };

  const currentWord = questionQueue[currentWordIndex];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{quiz.name}</h1>
        <div className={styles.actions}>
          <Button onClick={() => setShowAddWordModal(true)}>
            + Add Word
          </Button>
          <Button onClick={() => setShowBulkImportModal(true)}>
            📥 Bulk Import
          </Button>
          <Button onClick={showQuizTypeSelection} disabled={quiz.words.length === 0}>
            Start Quiz
          </Button>
        </div>
      </div>

      <div className={styles.wordsList}>
        <h2>Words ({quiz.words.length})</h2>
        {quiz.words.length === 0 ? (
          <p className={styles.emptyState}>No words yet. Add some words to start!</p>
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
          <h2>Add New Word</h2>
          <form onSubmit={handleAddWord}>
            <TextInput
              label="Word"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Enter the word..."
              required
            />
            <TextInput
              label="Definition"
              value={newDefinition}
              onChange={(e) => setNewDefinition(e.target.value)}
              placeholder="Enter the definition..."
              required
            />
            <div className={styles.modalActions}>
              <Button
                type="button"
                onClick={() => setShowAddWordModal(false)}
                style={{ background: "#6c757d" }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Word</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Quiz Modal */}
      <Modal open={showQuizModal} setOpen={setShowQuizModal} fullscreen={true}>
        <div className={styles.quizModalContent}>
          <h2>Quiz: {quiz.name}</h2>
          <div className={styles.quizProgress}>
            Question {currentWordIndex + 1} of {questionQueue.length}
            <div className={styles.score}>Score: {score}</div>
            {wrongAnswers.length > 0 && (
              <div className={styles.wrongAnswers}>Review: {wrongAnswers.length} words</div>
            )}
          </div>
          
          <div className={styles.quizQuestion}>
            <h3>What is the word for:</h3>
            <p className={styles.definition}>{currentWord?.definition}</p>
            
            {!showAnswer ? (
              <div className={styles.answerInput}>
                {quizType === "text" ? (
                  <>
                    <div className={styles.quizInputContainer}>
                      <TextInput
                        label="Your Answer"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer..."
                      />
                    </div>
                    <Button onClick={() => checkAnswer()} disabled={!userAnswer.trim()}>
                      Check Answer
                    </Button>
                  </>
                ) : (
                  <div className={styles.multipleChoice}>
                    <h4>Choose the correct answer:</h4>
                    <div className={styles.optionsGrid}>
                      {(() => {
                        console.log("Rendering multiple choice for word:", currentWord?.word);
                        const options = generateMultipleChoiceOptions(currentWord?.word, quiz.words);
                        console.log("Options to render:", options);
                        return options.map((option, index) => (
                          <button
                            key={index}
                            className={styles.optionButton}
                            onClick={() => checkAnswer(option)}
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
              <div className={styles.answerResult}>
                <p className={styles.correctAnswer}>
                  Correct answer: <strong>{currentWord?.word}</strong>
                </p>
                <Button onClick={nextQuestion}>
                  {currentWordIndex < questionQueue.length - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal open={showBulkImportModal} setOpen={setShowBulkImportModal}>
        <div className={styles.modalContent}>
          <h2>📥 Bulk Import Words</h2>
          <p className={styles.importInstructions}>
            Add multiple words at once using one of these formats:
          </p>
          <div className={styles.formatExamples}>
            <div className={styles.example}>
              <strong>CSV Format:</strong>
              <pre>apple,elma
banana,muz
orange,portakal</pre>
            </div>
            <div className={styles.example}>
              <strong>Dash Format:</strong>
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
              placeholder="Enter words here...&#10;&#10;Example:&#10;apple,elma&#10;banana,muz&#10;orange,portakal"
              rows={10}
              required
            />
            <div className={styles.modalActions}>
              <Button
                type="button"
                onClick={() => setShowBulkImportModal(false)}
                style={{ backgroundColor: '#6c757d' }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!bulkText.trim()}>
                Import Words
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Quiz Type Selection Modal */}
      <Modal open={showQuizTypeModal} setOpen={setShowQuizTypeModal}>
        <div className={styles.modalContent}>
          <h2>Choose Quiz Type</h2>
          <div className={styles.quizTypeOptions}>
            <div 
              className={styles.quizTypeCard}
              onClick={() => {
                setQuizType("text");
                setShowQuizTypeModal(false);
                startQuiz();
              }}
            >
              <h3>Text Input Quiz</h3>
              <p>Type the answer for each definition</p>
            </div>
            <div 
              className={styles.quizTypeCard}
              onClick={() => {
                setQuizType("multiple");
                setShowQuizTypeModal(false);
                startQuiz();
              }}
            >
              <h3>Multiple Choice Quiz</h3>
              <p>Choose from 4 options for each definition</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizDetail;
