-- AlterTable
ALTER TABLE "users" ADD COLUMN "google_id" TEXT;
ALTER TABLE "users" ADD COLUMN "provider" TEXT DEFAULT 'email';

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- AlterTable: Make password nullable (it's already nullable in schema but might need to be updated)
-- Note: If password column already allows NULL, this won't cause an error
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

