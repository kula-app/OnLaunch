/*
  Warnings:

  - Added the required column `productId` to the `SubscriptionItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionItem" ADD COLUMN     "productId" TEXT NOT NULL;
