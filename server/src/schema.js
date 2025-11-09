const gql = require("graphql-tag");

const typeDefs = gql`
  type Flashcard {
    id: ID!
    userId: String
    deckId: String
    front: String
    back: String
    due: String
    reviews: Int
    retention: Int
    new: Boolean
    createdAt: String
    nextReview: Int
    mastered: Boolean
  }

  type Deck {
    id: ID!
    userId: String
    name: String
    createdAt: String
    flashcards: [Flashcard]
  }

  type User {
    id: ID!
    password: String
    email: String
    name: String
    avatar: String
    provider: String
    createdAt: String
    decks: [Deck]
    flashcards: [Flashcard]
    quizzes: [Quiz]
  }

  type Quiz {
    id: ID!
    userId: String
    name: String
    createdAt: String
    words: [QuizWord]
  }

  type QuizWord {
    id: ID!
    quizId: String
    word: String
    definition: String
  }

  type Query {
    user: User
    deck(id: ID!): Deck
    quiz(id: ID!): Quiz
    isAuthenticated: Boolean!
    dueFlashcards: [Flashcard]
    newFlashcards: [Flashcard]
    dueFromDeck(deckId: ID!): [Flashcard]
    newFromDeck(deckId: ID!): [Flashcard]
    logout: Boolean!
  }

  type Mutation {
    createUser(email: String!, password: String!): String!
    loginUser(email: String!, password: String!): String!
    googleLogin(idToken: String!): String!
    createDeck(name: String!): Deck!
    updateDeck(id: ID!, name: String!): Deck!
    createFlashcard(data: CreateFlashcardInput): Flashcard!
    updateFlashcard(data: UpdateFlashcardInput): Flashcard!
    deleteFlashcard(id: ID!): Flashcard!
    deleteDeck(id: ID!): Deck!
    createQuiz(name: String!): Quiz!
    updateQuiz(id: ID!, name: String!): Quiz!
    deleteQuiz(id: ID!): Quiz!
    createQuizWord(data: CreateQuizWordInput!): QuizWord!
    updateQuizWord(id: ID!, word: String, definition: String): QuizWord!
    deleteQuizWord(id: ID!): QuizWord!
    addFlashcardToQuiz(flashcardId: ID!, quizId: ID!): QuizWord!
  }

  input UpdateFlashcardInput {
    id: ID!
    front: String
    back: String
    due: String
    reviews: Int
    retention: Int
    new: Boolean
    nextReview: Int
    mastered: Boolean
  }

  input CreateFlashcardInput {
    front: String
    back: String
    deckId: String!
  }

  input CreateQuizWordInput {
    word: String!
    definition: String!
    quizId: String!
  }

  input UpdateQuizWordInput {
    id: ID!
    word: String
    definition: String
  }
`;

module.exports = {
  typeDefs,
};