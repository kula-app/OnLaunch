/*
  Warnings:

  - You are about to drop the column `publicKey` on the `LoggedApiRequests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LoggedApiRequests" DROP COLUMN "publicKey";
