-- CreateEnum
CREATE TYPE "MessageActionLinkTarget" AS ENUM ('in_app_browser', 'share_sheet', 'system_browser');

-- AlterTable
ALTER TABLE "MessageAction" ADD COLUMN     "linkTarget" "MessageActionLinkTarget";
