-- Create Plant table
CREATE TABLE IF NOT EXISTS "Plant" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "species" TEXT,
  "location" TEXT,
  "imageUrl" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create CareType enum
CREATE TYPE "CareType" AS ENUM ('WATER', 'FERTILIZER', 'REPOT', 'PRUNE');

-- Create CareRecord table
CREATE TABLE IF NOT EXISTS "CareRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "plantId" TEXT NOT NULL,
  "type" "CareType" NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  CONSTRAINT "CareRecord_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "CareRecord_plantId_idx" ON "CareRecord"("plantId");
