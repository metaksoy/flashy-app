import { Link } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { useState } from "react";
import { useTranslation } from "../../../contexts/LanguageContext";
import Modal from "../Modal";
import Button from "../Button";
import styles from "./QuizCard.module.css";

const QuizCard = ({ quiz }) => {
  const { t } = useTranslation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const DELETE_QUIZ = gql`
    mutation deleteQuiz($id: ID!) {
      deleteQuiz(id: $id) {
        id
      }
    }
  `;

  const [deleteQuiz] = useMutation(DELETE_QUIZ, {
    refetchQueries: ["getDecks"],
    onCompleted: () => {
      toast.success(t("quizDeleted"));
      setDeleteModalOpen(false);
    },
    onError: (error) => {
      toast.error(t("errorOccurred") + ": " + error.message);
    },
  });

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteQuiz({ variables: { id: quiz.id } });
  };

  return (
    <>
      <div className={styles.quizCard}>
        <Link to={`/quiz/${quiz.id}`} className={styles.quizLink}>
          <h3 className={styles.quizName}>{quiz.name}</h3>
          <p className={styles.wordCount}>
            {quiz.words.length} {quiz.words.length === 1 ? t("word") : t("words")}
          </p>
        </Link>
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          title={t("delete")}
        >
          🗑️
        </button>
      </div>
      <Modal open={deleteModalOpen} setOpen={setDeleteModalOpen}>
        <div style={{ padding: "2rem" }}>
          <h4 style={{ marginBottom: "1.5rem" }}>{t("deleteQuiz")}</h4>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Button
              callback={() => setDeleteModalOpen(false)}
              style={{ background: "#6c757d" }}
            >
              {t("cancel")}
            </Button>
            <Button callback={confirmDelete} style={{ background: "#e34b4b" }}>
              {t("delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default QuizCard;
