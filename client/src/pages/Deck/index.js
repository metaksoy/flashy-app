import { useNavigate, useParams } from "react-router";
import { gql, useQuery, useMutation } from "@apollo/client";
import styles from "./Deck.module.css";
import { toast } from "react-toastify";
import Card from "../../common/components/Card";
import Button from "../../common/components/Button";
import Badge from "../../common/components/Badge";
import AddCardButton from "./AddCardButton";
import LoadingScreen from "../../common/components/LoadingScreen";
import EditCardModal from "./EditCardModal";
import { useState } from "react";
import RetentionBadge from "./RetentionBadge";
import Modal from "../../common/components/Modal";
import TextInput from "../../common/components/TextInput";

const Deck = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditDeckNameModalOpen, setIsEditDeckNameModalOpen] = useState(false);
  const [editDeckName, setEditDeckName] = useState("");
  const [editFlashcard, setEditFlashcard] = useState({
    front: "",
    back: "",
    id: "",
  });
  const navigate = useNavigate();
  const params = useParams();
  
  const GET_DECK = gql`
    query getDeck($deckId: ID!) {
      deck(id: $deckId) {
        id
        name
        flashcards {
          front
          back
          due
          retention
          reviews
          new
          id
        }
      }
    }
  `;

  const UPDATE_DECK = gql`
    mutation updateDeck($id: ID!, $name: String!) {
      updateDeck(id: $id, name: $name) {
        id
        name
      }
    }
  `;

  const [updateDeck] = useMutation(UPDATE_DECK, {
    refetchQueries: [{ query: GET_DECK, variables: { deckId: params.id } }],
  });

  const { data, loading } = useQuery(GET_DECK, {
    variables: { deckId: params.id },
  });

  if (loading) return <LoadingScreen />;
  if (data.deck) {
    // TODO: consider performing this on the server
    const deckCardsRetention = data.deck.flashcards.reduce((acc, curr) => {
      return acc + curr.retention;
    }, 0);
    const deckReviews = data.deck.flashcards.reduce((acc, curr) => {
      return acc + curr.reviews;
    }, 0);
    const deckRetention = Math.round((deckCardsRetention / deckReviews) * 100);
    const newCards = data.deck.flashcards.filter(
      (card) => card.new === true
    ).length;
    const dueCards = data.deck.flashcards.filter((card) => {
      return new Date(parseInt(card.due)) < new Date() && card.new === false;
    }).length;

    return (
      <>
        <EditCardModal
          flashcard={editFlashcard}
          open={isModalOpen}
          setOpen={setIsModalOpen}
          deckId={params.id}
        />
        <Modal open={isEditDeckNameModalOpen} setOpen={setIsEditDeckNameModalOpen}>
          <div style={{ padding: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>
              Deck İsmini Düzenle
            </h2>
            <TextInput 
              label="Deck İsmi"
              value={editDeckName} 
              onChange={(e) => setEditDeckName(e.target.value)}
              placeholder="Deck ismini girin..."
              required
            />
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <Button
                type="button"
                onClick={() => {
                  setIsEditDeckNameModalOpen(false);
                  setEditDeckName("");
                }}
                style={{ background: "#6c757d" }}
              >
                İptal
              </Button>
              <Button
                onClick={async () => {
                  if (editDeckName.trim()) {
                    try {
                      await updateDeck({
                        variables: { id: data.deck.id, name: editDeckName.trim() },
                      });
                      toast.success("Deck ismi güncellendi");
                      setIsEditDeckNameModalOpen(false);
                      setEditDeckName("");
                    } catch (error) {
                      toast.error("Deck ismi güncellenirken bir hata oluştu");
                    }
                  }
                }}
                disabled={!editDeckName.trim()}
              >
                Kaydet
              </Button>
            </div>
          </div>
        </Modal>
        <div className={styles.menu}>
          <h1 className={styles.title}>
            <span 
              onClick={() => {
                setEditDeckName(data.deck.name);
                setIsEditDeckNameModalOpen(true);
              }}
              style={{ cursor: "pointer", textDecoration: "underline" }}
              title="İsmi düzenlemek için tıklayın"
            >
              {data.deck.name}
            </span>
            {deckRetention > 0 ? (
              <RetentionBadge retention={deckRetention}>
                {" "}
                retention
              </RetentionBadge>
            ) : null}
            <Badge>{data.deck.flashcards.length} cards</Badge>
          </h1>
          <div>
            <Button
              callback={() => {
                navigate("new");
              }}
            >
              Learn new <Badge style={{ fontSize: "0.7em" }}>{newCards}</Badge>
            </Button>
            <Button
              callback={() => {
                navigate("due");
              }}
            >
              Study due <Badge style={{ fontSize: "0.7em" }}>{dueCards}</Badge>
            </Button>
          </div>
        </div>
        <div className={styles.flashcardContainer}>
          <AddCardButton
            callback={() => {
              setEditFlashcard({ front: "", back: "", id: "" });
              setIsModalOpen(true);
            }}
          />
          {data.deck.flashcards.map((flashcard) => (
            <Card
              key={flashcard.id}
              flashcard={flashcard}
              onClick={() => {
                setEditFlashcard(flashcard);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      </>
    );
  } else {
    toast.error("Deck not found");
    return <h1>Error :(</h1>;
  }
};

export default Deck;
