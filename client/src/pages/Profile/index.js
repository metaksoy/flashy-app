import { gql, useQuery } from "@apollo/client";
import LoadingScreen from "../../common/components/LoadingScreen";
import styles from "./Profile.module.css";

const Profile = () => {
  const GET_USER = gql`
    query getUser {
      user {
        id
        email
        name
        avatar
        createdAt
        provider
        decks {
          id
          name
        }
        flashcards {
          id
        }
        quizzes {
          id
          name
        }
      }
    }
  `;

  const { data, loading, error } = useQuery(GET_USER);

  if (loading) return <LoadingScreen fullscreen={true} />;
  if (error) return <p>Error loading profile :(</p>;

  const user = data.user;
  const deckCount = user.decks?.length || 0;
  const flashcardCount = user.flashcards?.length || 0;
  const quizCount = user.quizzes?.length || 0;

  return (
    <div className={styles.profile}>
      <div className={styles.profileHeader}>
        {user.avatar && (
          <img src={user.avatar} alt="Profile" className={styles.avatar} />
        )}
        {!user.avatar && (
          <div className={styles.avatarPlaceholder}>
            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
        <div className={styles.profileInfo}>
          <h1 className={styles.name}>{user.name || "Kullanıcı"}</h1>
          <p className={styles.email}>{user.email}</p>
          {user.provider === "google" && (
            <span className={styles.providerBadge}>Google ile giriş</span>
          )}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>{deckCount}</h3>
          <p>Deck</p>
        </div>
        <div className={styles.statCard}>
          <h3>{flashcardCount}</h3>
          <p>Flashcard</p>
        </div>
        <div className={styles.statCard}>
          <h3>{quizCount}</h3>
          <p>Quiz</p>
        </div>
      </div>

      <div className={styles.profileDetails}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Üye Olma Tarihi:</span>
          <span className={styles.value}>
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("tr-TR") : "Bilinmiyor"}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Giriş Yöntemi:</span>
          <span className={styles.value}>
            {user.provider === "google" ? "Google" : "Email/Şifre"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;

