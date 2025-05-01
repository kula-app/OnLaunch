-- AlterEnum
ALTER TYPE "ActionType" ADD VALUE 'open_link';

-- AlterTable
ALTER TABLE "MessageAction" ADD COLUMN     "link" TEXT;
