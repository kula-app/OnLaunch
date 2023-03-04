/*
  Warnings:

  - The values [button,dismiss_button] on the enum `ActionType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `buttonDesign` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ButtonDesign" AS ENUM ('text', 'filled');

-- AlterEnum
BEGIN;
CREATE TYPE "ActionType_new" AS ENUM ('dismiss');
ALTER TABLE "Action" ALTER COLUMN "actionType" TYPE "ActionType_new" USING ("actionType"::text::"ActionType_new");
ALTER TYPE "ActionType" RENAME TO "ActionType_old";
ALTER TYPE "ActionType_new" RENAME TO "ActionType";
DROP TYPE "ActionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "buttonDesign" "ButtonDesign" NOT NULL;
