-- AlterTable: Add google_id column (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'google_id'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "google_id" TEXT;
    END IF;
END $$;

-- AlterTable: Add provider column (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'provider'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "provider" TEXT DEFAULT 'email';
    END IF;
END $$;

-- CreateIndex: Create unique index on google_id (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = 'users_google_id_key'
    ) THEN
        CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
    END IF;
END $$;

-- AlterTable: Make password nullable (safe to run even if already nullable)
-- Check if column is NOT NULL before trying to alter it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'password' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
    END IF;
END $$;

