/*
  Warnings:

  - Added the required column `invitedEmail` to the `UserInvitationToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserInvitationToken" ADD COLUMN     "invitedEmail" TEXT NOT NULL;
