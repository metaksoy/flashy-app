import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import Modal from "../../common/components/Modal";
import TextInput from "../../common/components/TextInput";
import Button from "../../common/components/Button";
import { useTranslation } from "../../contexts/LanguageContext";

const NewQuizModal = ({ open, setOpen }) => {
  const { t } = useTranslation();
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
      toast.success(t("quizCreated"));
      setOpen(false);
      setName("");
    },
    onError: (error) => {
      toast.error(t("errorOccurred") + ": " + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      createQuiz({ variables: { name: name.trim() } });
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div style={{ padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>
          {t("createQuiz")}
        </h2>
        <form onSubmit={handleSubmit}>
          <TextInput
            label={t("quizName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("enterQuizName")}
            required
          />
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: "#6c757d" }}
            >
              {t("cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !name.trim()}
            >
              {loading ? t("creating") : t("createQuizButton")}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default NewQuizModal;
