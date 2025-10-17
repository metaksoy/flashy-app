import { gql, useQuery } from "@apollo/client";
import DeckCard from "../../common/components/DeckCard";
import QuizCard from "../../common/components/QuizCard";
import LoadingScreen from "../../common/components/LoadingScreen";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
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
  if (error) return <p>Error :(</p>;
  if (loading) return <LoadingScreen />;
  return (
    <div className={styles.dashboard}>
      <div className={styles.section}>
        <h2>Your Decks</h2>
        <div className={styles.cardContainer}>
          {data.user.decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
          {data.user.decks.length === 0 && (
            <p className={styles.emptyMessage}>No decks yet. Create your first deck!</p>
          )}
        </div>
      </div>
      
      <div className={styles.section}>
        <h2>Your Quizzes</h2>
        <div className={styles.cardContainer}>
          {data.user.quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
          {data.user.quizzes.length === 0 && (
            <p className={styles.emptyMessage}>No quizzes yet. Create your first quiz!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
