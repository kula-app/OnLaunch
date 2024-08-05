-- AlterTable
ALTER TABLE "LoggedApiRequests" ADD COLUMN     "clientBundleId" TEXT,
ADD COLUMN     "clientBundleVersion" TEXT,
ADD COLUMN     "clientLocale" TEXT,
ADD COLUMN     "clientLocaleLanguageCode" TEXT,
ADD COLUMN     "clientLocaleRegionCode" TEXT,
ADD COLUMN     "clientPlatformName" TEXT,
ADD COLUMN     "clientPlatformVersion" TEXT,
ADD COLUMN     "clientReleaseVersion" TEXT;
