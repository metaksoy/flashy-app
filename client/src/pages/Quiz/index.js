import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import LoadingScreen from "../../common/components/LoadingScreen";
import QuizCard from "../../common/components/QuizCard";
import NewQuizModal from "./NewQuizModal";
import QuizLink from "./QuizLink";
import { useTranslation } from "../../contexts/LanguageContext";
import styles from "./Quiz.module.css";

const Quiz = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const GET_QUIZZES = gql`
    query getUserQuizzes {
      user {
        quizzes {
          id
          name
          words {
            id
            word
            definition
          }
        }
      }
    }
  `;

  const { data, loading, error } = useQuery(GET_QUIZZES);

  if (loading) return <LoadingScreen fullscreen={true} />;
  if (error) return <p>{t("errorLoadingQuizzes")} :(</p>;

  return (
    <>
      <h1>{t("quizzes")}</h1>
      <div className={styles.quizContainer}>
        {data.user.quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>

      <NewQuizModal open={showModal} setOpen={setShowModal} />

      {data.user.quizzes.length === 0 && (
        <div className={styles.emptyState}>
          <p>{t("noQuizzesYet")}</p>
        </div>
      )}
    </>
  );
};

export default Quiz;
