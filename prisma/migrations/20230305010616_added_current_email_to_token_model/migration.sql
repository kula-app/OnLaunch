/*
  Warnings:

  - Added the required column `currentEmail` to the `EmailChangeToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailChangeToken" ADD COLUMN     "currentEmail" TEXT NOT NULL;
