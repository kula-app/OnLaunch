-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_messageId_fkey";

-- DropForeignKey
ALTER TABLE "App" DROP CONSTRAINT "App_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_appId_fkey";

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "App" ADD CONSTRAINT "App_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
