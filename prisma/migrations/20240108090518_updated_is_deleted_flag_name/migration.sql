/*
  Warnings:

  - You are about to drop the column `isRevoked` on the `AppAdminToken` table. All the data in the column will be lost.
  - You are about to drop the column `isRevoked` on the `OrganisationAdminToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppAdminToken" DROP COLUMN "isRevoked",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OrganisationAdminToken" DROP COLUMN "isRevoked",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
