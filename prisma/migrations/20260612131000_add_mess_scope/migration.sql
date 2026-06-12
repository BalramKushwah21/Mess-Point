-- CreateTable
CREATE TABLE "Mess" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mess_pkey" PRIMARY KEY ("id")
);

-- Backfill one mess for data that already exists.
INSERT INTO "Mess" ("id", "name", "createdAt", "updatedAt")
VALUES ('main-mess', 'Main Mess', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Scope existing members to the default mess.
ALTER TABLE "Member" ADD COLUMN "messId" TEXT;
UPDATE "Member" SET "messId" = 'main-mess' WHERE "messId" IS NULL;
ALTER TABLE "Member" ALTER COLUMN "messId" SET NOT NULL;
CREATE INDEX "Member_messId_idx" ON "Member"("messId");
ALTER TABLE "Member"
ADD CONSTRAINT "Member_messId_fkey"
FOREIGN KEY ("messId") REFERENCES "Mess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Scope existing settings to the default mess.
ALTER TABLE "Setting" ADD COLUMN "messId" TEXT;
UPDATE "Setting" SET "messId" = 'main-mess' WHERE "messId" IS NULL;
ALTER TABLE "Setting" ALTER COLUMN "messId" SET NOT NULL;
ALTER TABLE "Setting" DROP CONSTRAINT "Setting_pkey";
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_pkey" PRIMARY KEY ("messId", "key");
CREATE INDEX "Setting_messId_idx" ON "Setting"("messId");
ALTER TABLE "Setting"
ADD CONSTRAINT "Setting_messId_fkey"
FOREIGN KEY ("messId") REFERENCES "Mess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
