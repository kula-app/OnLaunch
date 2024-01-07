-- CreateEnum
CREATE TYPE "AppAccessLevel" AS ENUM ('FULL', 'MAGIC');

-- CreateEnum
CREATE TYPE "OrganisationAccessLevel" AS ENUM ('FULL');

-- CreateTable
CREATE TABLE "OrganisationAdminToken" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "role" "OrganisationAccessLevel" NOT NULL DEFAULT 'FULL',
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "orgId" INTEGER NOT NULL,

    CONSTRAINT "OrganisationAdminToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppAdminToken" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "role" "AppAccessLevel" NOT NULL DEFAULT 'FULL',
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "appId" INTEGER,

    CONSTRAINT "AppAdminToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoggedAdminApiRequests" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ip" TEXT NOT NULL,
    "token" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "LoggedAdminApiRequests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationAdminToken_token_key" ON "OrganisationAdminToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AppAdminToken_token_key" ON "AppAdminToken"("token");

-- AddForeignKey
ALTER TABLE "OrganisationAdminToken" ADD CONSTRAINT "OrganisationAdminToken_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppAdminToken" ADD CONSTRAINT "AppAdminToken_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
