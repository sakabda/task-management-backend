/*
  Warnings:

  - The `role` column on the `Invitation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `WorkspaceMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[projectId,number]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,slug]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'QA', 'CLIENT', 'GUEST');

-- DropIndex
DROP INDEX "Workspace_organizationId_idx";

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "message" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "WorkspaceRole" NOT NULL DEFAULT 'DEVELOPER';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "link" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "WorkspaceMember" DROP COLUMN "role",
ADD COLUMN     "role" "WorkspaceRole" NOT NULL DEFAULT 'DEVELOPER';

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMember_workspaceMemberId_idx" ON "ProjectMember"("workspaceMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_projectId_number_key" ON "Task"("projectId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_organizationId_slug_key" ON "Workspace"("organizationId", "slug");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
