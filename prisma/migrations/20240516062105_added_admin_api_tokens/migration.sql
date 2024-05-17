-- CreateTable
CREATE TABLE "LoggedAdminApiRequests" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ip" TEXT NOT NULL,
    "token" TEXT NOT NULL DEFAULT '',
    "success" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LoggedAdminApiRequests_pkey" PRIMARY KEY ("id")
);
