/*
  Warnings:

  - Added the required column `archived` to the `VerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "archived" BOOLEAN NOT NULL;
