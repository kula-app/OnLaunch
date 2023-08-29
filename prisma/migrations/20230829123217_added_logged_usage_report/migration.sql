-- CreateTable
CREATE TABLE "LoggedUsageReport" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requests" INTEGER NOT NULL,
    "orgId" INTEGER NOT NULL,

    CONSTRAINT "LoggedUsageReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoggedUsageReport" ADD CONSTRAINT "LoggedUsageReport_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
