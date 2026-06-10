-- CreateEnum
CREATE TYPE "MessageActionLinkTarget" AS ENUM ('in_app_browser', 'share_sheet', 'system_browser');

-- AlterEnum
ALTER TYPE "ActionType" ADD VALUE 'open_link';

-- AlterTable
ALTER TABLE "MessageAction" ADD COLUMN     "link" TEXT,
ADD COLUMN     "linkTarget" "MessageActionLinkTarget";
