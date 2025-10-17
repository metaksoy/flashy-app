import Modal from "../../common/components/Modal";
import { gql, useMutation } from "@apollo/client";
import TextInput from "../../common/components/TextInput";
import Button from "../../common/components/Button";
import { useState } from "react";

const CREATE_DECK = gql`
  mutation createDeck($name: String!) {
    createDeck(name: $name) {
      id
      name
    }
  }
`;

const NewDeckModal = ({ open, setOpen }) => {
  const [createDeck] = useMutation(CREATE_DECK, {
    update(cache, { data: { createDeck } }) {
      const { user } = cache.readQuery({
        query: gql`
          query getUserDecks {
            user {
              decks {
                id
                name
              }
            }
          }
        `,
      });
      cache.writeQuery({
        query: gql`
          query getUserDecks {
            user {
              decks {
                id
                name
              }
            }
          }
        `,
        data: {
          user: { ...user, decks: [...user.decks, createDeck] },
        },
      });
    },
  });
  const [name, setName] = useState("");
  return (
    <Modal open={open} setOpen={setOpen}>
      <div style={{ padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>
          Create New Deck
        </h2>
        <TextInput 
          label="Deck Name"
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter deck name..."
          required
        />
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <Button
            type="button"
            onClick={() => setOpen(false)}
            style={{ background: "#6c757d" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (name.trim()) {
                createDeck({ variables: { name: name.trim() } });
                setOpen(false);
                setName("");
              }
            }}
            disabled={!name.trim()}
          >
            Create Deck
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewDeckModal;
