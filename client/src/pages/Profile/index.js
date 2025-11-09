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
            {user.createdAt ? (() => {
              try {
                // PostgreSQL timestamp formatını parse et: "2025-10-09 15:43:06.150 +0300"
                // Önce timezone offset'i kaldırıp ISO formatına çevir
                let dateStr = user.createdAt;
                // Eğer +0300 gibi bir offset varsa, onu ISO formatına çevir
                if (dateStr.includes('+') || dateStr.includes('-')) {
                  // Son boşluktan sonraki kısmı al (timezone offset)
                  const parts = dateStr.split(' ');
                  if (parts.length >= 2) {
                    const timezoneOffset = parts[parts.length - 1];
                    const dateTime = parts.slice(0, -1).join(' ');
                    // +0300 formatını +03:00 formatına çevir
                    if (timezoneOffset.match(/^[+-]\d{4}$/)) {
                      const sign = timezoneOffset[0];
                      const hours = timezoneOffset.substring(1, 3);
                      const minutes = timezoneOffset.substring(3, 5);
                      dateStr = `${dateTime}${sign}${hours}:${minutes}`;
                    } else {
                      dateStr = dateTime;
                    }
                  }
                }
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) {
                  // Eğer hala parse edilemezse, sadece tarih kısmını göster
                  return user.createdAt.split(' ')[0];
                }
                return date.toLocaleDateString("tr-TR", {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              } catch (e) {
                // Hata durumunda sadece tarih kısmını göster
                return user.createdAt.split(' ')[0];
              }
            })() : "Bilinmiyor"}
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

