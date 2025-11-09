import { gql, useQuery } from "@apollo/client";
import DeckCard from "../../common/components/DeckCard";
import QuizCard from "../../common/components/QuizCard";
import LoadingScreen from "../../common/components/LoadingScreen";
import { useTranslation } from "../../contexts/LanguageContext";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const { t } = useTranslation();
  const GET_DECKS = gql`
    query getDecks {
      user {
        decks {
          id
          name
          flashcards {
            front
            back
          }
        }
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
  const { data, loading, error } = useQuery(GET_DECKS);
  if (error) return <p>{t("error")} :(</p>;
  if (loading) return <LoadingScreen />;
  return (
    <div className={styles.dashboard}>
      <div className={styles.section}>
        <h2>{t("yourDecks")}</h2>
        <div className={styles.cardContainer}>
          {data.user.decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
          {data.user.decks.length === 0 && (
            <p className={styles.emptyMessage}>{t("noDecksYet")}</p>
          )}
        </div>
      </div>
      
      <div className={styles.section}>
        <h2>{t("yourQuizzes")}</h2>
        <div className={styles.cardContainer}>
          {data.user.quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
          {data.user.quizzes.length === 0 && (
            <p className={styles.emptyMessage}>{t("noQuizzesYet")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
