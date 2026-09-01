-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxMembers" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "maxWorkspaces" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "plan" "WorkspacePlan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "status" "OrgStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "storageLimit" INTEGER NOT NULL DEFAULT 1024;

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");
