import { Link } from "react-router-dom";
import styles from "./QuizLink.module.css";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";

const DELETE_QUIZ = gql`
  mutation deleteQuiz($id: ID!) {
    deleteQuiz(id: $id) {
      id
      name
    }
  }
`;

const QuizLink = ({ id, name }) => {
  const [deleteQuiz] = useMutation(DELETE_QUIZ, {
    refetchQueries: ["getUserDecks"],
    update(cache, { data: { deleteQuiz } }) {
      cache.evict({ id: `Quiz:${deleteQuiz.id}` });
    },
  });

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      deleteQuiz({ variables: { id } });
    }
  };

  return (
    <div className={styles.quizLink}>
      <Link className={styles.link} to={`/quiz/${id}`}>
        {name}
      </Link>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={styles.deleteIcon}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        onClick={handleDelete}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </div>
  );
};

export default QuizLink;
