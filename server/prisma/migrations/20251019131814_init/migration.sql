-- CreateTable
CREATE TABLE "decks" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT DEFAULT '',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "deck_id" UUID,
    "front" TEXT DEFAULT '',
    "back" TEXT DEFAULT '',
    "due" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "new" BOOLEAN DEFAULT true,
    "retention" INTEGER DEFAULT 0,
    "reviews" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "nextReview" INTEGER DEFAULT 1,
    "mastered" BOOLEAN DEFAULT false,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "password" TEXT DEFAULT '',
    "avatar" TEXT DEFAULT '',
    "name" TEXT DEFAULT '',
    "email" TEXT DEFAULT '',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT DEFAULT '',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_words" (
    "id" UUID NOT NULL,
    "quiz_id" UUID,
    "word" TEXT DEFAULT '',
    "definition" TEXT DEFAULT '',

    CONSTRAINT "quiz_words_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_words" ADD CONSTRAINT "quiz_words_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
