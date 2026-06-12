/*
  Warnings:

  - Made the column `userId` on table `Mess` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Mess" ALTER COLUMN "userId" SET NOT NULL;
