import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import Modal from "../../common/components/Modal";
import TextInput from "../../common/components/TextInput";
import Button from "../../common/components/Button";

const NewQuizModal = ({ open, setOpen }) => {
  const [name, setName] = useState("");

  const CREATE_QUIZ = gql`
    mutation createQuiz($name: String!) {
      createQuiz(name: $name) {
        id
        name
      }
    }
  `;

  const [createQuiz, { loading }] = useMutation(CREATE_QUIZ, {
    refetchQueries: ["getUserDecks"],
    onCompleted: () => {
      toast.success("Quiz created successfully!");
      setOpen(false);
      setName("");
    },
    onError: (error) => {
      toast.error("Failed to create quiz: " + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted, name:", name.trim());
    if (name.trim()) {
      console.log("Calling createQuiz mutation");
      createQuiz({ variables: { name: name.trim() } });
    } else {
      console.log("Name is empty");
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div style={{ padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>
          Create New Quiz
        </h2>
        <form onSubmit={handleSubmit} onClick={() => console.log("Form clicked")}>
          <TextInput
            label="Quiz Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter quiz name..."
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
              type="submit" 
              disabled={loading}
              onClick={() => console.log("Button clicked, name:", name, "trimmed:", name.trim(), "disabled:", loading || !name.trim())}
            >
              {loading ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default NewQuizModal;
