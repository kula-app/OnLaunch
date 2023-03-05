/*
  Warnings:

  - A unique constraint covering the columns `[invitationToken]` on the table `Organisation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "invitationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_invitationToken_key" ON "Organisation"("invitationToken");
