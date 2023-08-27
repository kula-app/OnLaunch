-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_orgId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionItem" DROP CONSTRAINT "SubscriptionItem_subId_fkey";

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_subId_fkey" FOREIGN KEY ("subId") REFERENCES "Subscription"("subId") ON DELETE CASCADE ON UPDATE CASCADE;
