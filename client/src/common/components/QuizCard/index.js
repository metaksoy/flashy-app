import { Link } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import styles from "./QuizCard.module.css";

const QuizCard = ({ quiz }) => {
  const DELETE_QUIZ = gql`
    mutation deleteQuiz($id: ID!) {
      deleteQuiz(id: $id) {
        id
      }
    }
  `;

  const [deleteQuiz] = useMutation(DELETE_QUIZ, {
    refetchQueries: ["getUserDecks"],
    onCompleted: () => {
      toast.success("Quiz deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete quiz: " + error.message);
    },
  });

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      deleteQuiz({ variables: { id: quiz.id } });
    }
  };

  return (
    <div className={styles.quizCard}>
      <Link to={`/quiz/${quiz.id}`} className={styles.quizLink}>
        <h3 className={styles.quizName}>{quiz.name}</h3>
        <p className={styles.wordCount}>
          {quiz.words.length} {quiz.words.length === 1 ? "word" : "words"}
        </p>
        <div className={styles.quizActions}>
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            title="Delete quiz"
          >
            🗑️
          </button>
        </div>
      </Link>
    </div>
  );
};

export default QuizCard;
