-- AlterTable
ALTER TABLE "LoggedApiRequests" ADD COLUMN     "clientPackageName" TEXT,
ADD COLUMN     "clientUpdateAvailable" BOOLEAN,
ADD COLUMN     "clientVersionCode" TEXT,
ADD COLUMN     "clientVersionName" TEXT;
