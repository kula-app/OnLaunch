-- CreateTable
CREATE TABLE "SubscriptionItem" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subItemId" TEXT NOT NULL,
    "isMetered" BOOLEAN NOT NULL DEFAULT false,
    "subId" TEXT NOT NULL,

    CONSTRAINT "SubscriptionItem_pkey" PRIMARY KEY ("subItemId")
);

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_subId_fkey" FOREIGN KEY ("subId") REFERENCES "Subscription"("subId") ON DELETE RESTRICT ON UPDATE CASCADE;
