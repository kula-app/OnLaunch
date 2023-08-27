/*
  Warnings:

  - You are about to drop the column `isMetered` on the `SubscriptionItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SubscriptionItem" DROP COLUMN "isMetered",
ADD COLUMN     "metered" BOOLEAN NOT NULL DEFAULT false;
