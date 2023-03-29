/*
  Warnings:

  - Made the column `invitationToken` on table `Organisation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Organisation" ALTER COLUMN "invitationToken" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthday" TIMESTAMP(3);
