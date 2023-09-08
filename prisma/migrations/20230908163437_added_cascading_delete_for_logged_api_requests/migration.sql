-- DropForeignKey
ALTER TABLE "LoggedApiRequests" DROP CONSTRAINT "LoggedApiRequests_appId_fkey";

-- AddForeignKey
ALTER TABLE "LoggedApiRequests" ADD CONSTRAINT "LoggedApiRequests_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
