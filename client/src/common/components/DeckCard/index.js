import { Link } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import styles from "./DeckCard.module.css";

const DeckCard = (props) => {
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
      toast.success("Deck deleted successfully!");
      setDeleteModalOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to delete deck: " + error.message);
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
            {props.deck.flashcards.length === 1 ? "card" : "cards"}
          </h3>
        </Link>
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          title="Delete deck"
        >
          🗑️
        </button>
      </div>
      <Modal open={deleteModalOpen} setOpen={setDeleteModalOpen}>
        <div style={{ padding: "2rem" }}>
          <h4 style={{ marginBottom: "1.5rem" }}>Delete this deck?</h4>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Button
              callback={() => setDeleteModalOpen(false)}
              style={{ background: "#6c757d" }}
            >
              Cancel
            </Button>
            <Button callback={confirmDelete} style={{ background: "#e34b4b" }}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DeckCard;
