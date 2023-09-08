-- CreateTable
CREATE TABLE "LoggedApiRequests" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ip" TEXT NOT NULL,
    "appId" INTEGER NOT NULL,
    "publicKey" TEXT NOT NULL,

    CONSTRAINT "LoggedApiRequests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoggedApiRequests" ADD CONSTRAINT "LoggedApiRequests_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
