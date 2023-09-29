-- AlterTable
ALTER TABLE "App" ADD COLUMN     "idOfLastReportedApiRequest" INTEGER;

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateTable
CREATE TABLE "LoggedUsageReport" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requests" INTEGER NOT NULL,
    "isReportedAsInvoice" BOOLEAN NOT NULL DEFAULT false,
    "orgId" INTEGER NOT NULL,

    CONSTRAINT "LoggedUsageReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subId" TEXT NOT NULL,
    "subName" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "orgId" INTEGER NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("subId")
);

-- CreateTable
CREATE TABLE "SubscriptionItem" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subItemId" TEXT NOT NULL,
    "metered" BOOLEAN NOT NULL DEFAULT false,
    "productId" TEXT NOT NULL,
    "subId" TEXT NOT NULL,

    CONSTRAINT "SubscriptionItem_pkey" PRIMARY KEY ("subItemId")
);

-- AddForeignKey
ALTER TABLE "LoggedUsageReport" ADD CONSTRAINT "LoggedUsageReport_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_subId_fkey" FOREIGN KEY ("subId") REFERENCES "Subscription"("subId") ON DELETE CASCADE ON UPDATE CASCADE;
