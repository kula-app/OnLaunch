/*
  Warnings:

  - You are about to drop the column `userId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `customer` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "customer" TEXT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "customer";
