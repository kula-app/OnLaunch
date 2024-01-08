/*
  Warnings:

  - Made the column `appId` on table `AppAdminToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AppAdminToken" ALTER COLUMN "appId" SET NOT NULL;
