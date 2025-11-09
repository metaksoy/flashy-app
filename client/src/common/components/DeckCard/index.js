import { Link } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { useState } from "react";
import { useTranslation } from "../../../contexts/LanguageContext";
import Modal from "../Modal";
import Button from "../Button";
import styles from "./DeckCard.module.css";

const DeckCard = (props) => {
  const { t } = useTranslation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const DELETE_DECK = gql`
    mutation deleteDeck($id: ID!) {
      deleteDeck(id: $id) {
        id
        name
      }
    }
  `;

  const [deleteDeck] = useMutation(DELETE_DECK, {
    refetchQueries: ["getDecks"],
    onCompleted: () => {
      toast.success(t("deckDeleted"));
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
    deleteDeck({ variables: { id: props.deck.id } });
  };

  return (
    <>
      <div className={styles.card}>
        <Link to={`/deck/${props.deck.id}`} className={styles.cardLink}>
          <h2 className={styles.title}>{props.deck.name}</h2>
          <h3 className={styles.cardCount}>
            {props.deck.flashcards.length}{" "}
            {props.deck.flashcards.length === 1 ? t("card") : t("cards")}
          </h3>
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
          <h4 style={{ marginBottom: "1.5rem" }}>{t("deleteDeck")}</h4>
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

export default DeckCard;
