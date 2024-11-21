-- RenameTable
ALTER TABLE "Action" RENAME TO "MessageAction";

-- AlterTable
ALTER TABLE "MessageAction" RENAME CONSTRAINT "Action_pkey" TO "MessageAction_pkey";

-- AlterTable
ALTER TABLE "MessageAction" RENAME CONSTRAINT "Action_messageId_fkey" TO "MessageAction_messageId_fkey";
