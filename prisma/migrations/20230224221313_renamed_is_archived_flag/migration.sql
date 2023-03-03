/*
  Warnings:

  - You are about to drop the column `archived` on the `VerificationToken` table. All the data in the column will be lost.
  - Added the required column `isArchived` to the `VerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerificationToken" DROP COLUMN "archived",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL;
