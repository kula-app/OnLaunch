/*
  Warnings:

  - You are about to drop the column `name` on the `UsersInOrganisations` table. All the data in the column will be lost.
  - Added the required column `role` to the `UsersInOrganisations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UsersInOrganisations" DROP COLUMN "name",
ADD COLUMN     "role" "Role" NOT NULL;
