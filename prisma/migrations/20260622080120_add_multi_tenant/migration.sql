-- ─────────────────────────────────────────────────────────────
-- Phase 1 — Multi-tenant foundation (additive, backward-compatible)
--
-- Adds: Organization, Workspace, Department, Team, WorkspaceMember,
--       TeamMember, Invitation models + tenant column on Project and
--       activeWorkspaceId on User. New enums: Role, InvitationStatus,
--       ProjectHealth, RiskLevel. Phase-2 Project columns added now so
--       this is a single migration.
--
-- Backfill: every existing User/Project is placed into a default
-- Organization + Workspace. Existing User.role ("ADMIN"→ORG_ADMIN,
-- "USER"→DEVELOPER) is mapped to a WorkspaceMember row.
-- Existing User.role string is NOT touched, so legacy auth("USER","ADMIN")
-- middleware keeps working during the rollout window.
-- ─────────────────────────────────────────────────────────────

-- New enums
CREATE TYPE "Role" AS ENUM ('ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'QA', 'CLIENT', 'GUEST');

CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'REVOKED');

CREATE TYPE "ProjectHealth" AS ENUM ('ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'ON_HOLD');

CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Additive columns on existing tables (all nullable → current app keeps running)
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT,
                    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    ADD COLUMN "activeWorkspaceId" TEXT;

ALTER TABLE "Project" ADD COLUMN "startDate"   TIMESTAMP(3),
                      ADD COLUMN "endDate"     TIMESTAMP(3),
                      ADD COLUMN "budget"      DECIMAL(12,2),
                      ADD COLUMN "clientId"    TEXT,
                      ADD COLUMN "status"      TEXT NOT NULL DEFAULT 'PLANNED',
                      ADD COLUMN "progress"    INTEGER NOT NULL DEFAULT 0,
                      ADD COLUMN "health"      "ProjectHealth" NOT NULL DEFAULT 'ON_TRACK',
                      ADD COLUMN "riskLevel"   "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
                      ADD COLUMN "priority"    "Priority" NOT NULL DEFAULT 'MEDIUM',
                      ADD COLUMN "isArchived"  BOOLEAN NOT NULL DEFAULT false,
                      ADD COLUMN "isTemplate"  BOOLEAN NOT NULL DEFAULT false,
                      ADD COLUMN "workspaceId" TEXT;

-- Constraint: progress must be 0–100
ALTER TABLE "Project" ADD CONSTRAINT "Project_progress_check" CHECK ("progress" >= 0 AND "progress" <= 100);

-- ── Organization ──────────────────────────────────────────────
CREATE TABLE "Organization" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "description" TEXT,
    "logoUrl"     TEXT,
    "ownerId"     TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
CREATE INDEX "Organization_ownerId_idx" ON "Organization"("ownerId");

-- ── Workspace ─────────────────────────────────────────────────
CREATE TABLE "Workspace" (
    "id"            TEXT NOT NULL,
    "name"          TEXT NOT NULL,
    "slug"          TEXT NOT NULL,
    "description"   TEXT,
    "iconUrl"       TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");
CREATE INDEX "Workspace_organizationId_idx" ON "Workspace"("organizationId");

-- ── Department ────────────────────────────────────────────────
CREATE TABLE "Department" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Department_workspaceId_name_key" ON "Department"("workspaceId", "name");
CREATE INDEX "Department_workspaceId_idx" ON "Department"("workspaceId");

-- ── Team ──────────────────────────────────────────────────────
CREATE TABLE "Team" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "workspaceId" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Team_workspaceId_name_key" ON "Team"("workspaceId", "name");
CREATE INDEX "Team_workspaceId_idx" ON "Team"("workspaceId");
CREATE INDEX "Team_departmentId_idx" ON "Team"("departmentId");

-- ── WorkspaceMember ───────────────────────────────────────────
CREATE TABLE "WorkspaceMember" (
    "id"          TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "role"        "Role" NOT NULL DEFAULT 'DEVELOPER',
    "joinedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

-- ── TeamMember ────────────────────────────────────────────────
CREATE TABLE "TeamMember" (
    "id"                TEXT NOT NULL,
    "teamId"            TEXT NOT NULL,
    "workspaceMemberId" TEXT NOT NULL,
    "joinedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TeamMember_teamId_workspaceMemberId_key" ON "TeamMember"("teamId", "workspaceMemberId");
CREATE INDEX "TeamMember_workspaceMemberId_idx" ON "TeamMember"("workspaceMemberId");

-- ── Invitation ────────────────────────────────────────────────
CREATE TABLE "Invitation" (
    "id"             TEXT NOT NULL,
    "email"          TEXT NOT NULL,
    "token"          TEXT NOT NULL,
    "status"         "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "role"           "Role" NOT NULL DEFAULT 'DEVELOPER',
    "inviterId"      TEXT NOT NULL,
    "inviteeId"      TEXT,
    "organizationId" TEXT,
    "workspaceId"    TEXT,
    "expiresAt"      TIMESTAMP(3),
    "acceptedAt"     TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");
CREATE INDEX "Invitation_inviterId_idx" ON "Invitation"("inviterId");
CREATE INDEX "Invitation_status_idx" ON "Invitation"("status");

-- ── Foreign keys (hierarchy) ──────────────────────────────────
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Department" ADD CONSTRAINT "Department_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Team" ADD CONSTRAINT "Team_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Team" ADD CONSTRAINT "Team_departmentId_fkey"
    FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Foreign keys (memberships) ────────────────────────────────
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_workspaceMemberId_fkey"
    FOREIGN KEY ("workspaceMemberId") REFERENCES "WorkspaceMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Foreign keys (invitations) ────────────────────────────────
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_inviterId_fkey"
    FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_inviteeId_fkey"
    FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Tenant FK on Project (additive; rows backfilled below) ────
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Project_workspaceId_idx" ON "Project"("workspaceId");

-- ── Active-workspace FK on User (self; nullable) ─────────────
ALTER TABLE "User" ADD CONSTRAINT "User_activeWorkspaceId_fkey"
    FOREIGN KEY ("activeWorkspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ══════════════════════════════════════════════════════════════
-- BACKFILL — idempotent (guarded by existence checks)
-- ══════════════════════════════════════════════════════════════

-- 1) Default organization — pick the first ADMIN user as owner, else
--    the first user by createdAt. Uses a DO block so it only runs once.
DO $$
DECLARE
    v_owner TEXT;
    v_org   TEXT;
    v_ws    TEXT;
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM "Organization" WHERE slug = 'default-org';
    IF v_count = 0 THEN
        -- Owner: first ADMIN, fallback to earliest user
        SELECT id INTO v_owner FROM "User" WHERE role = 'ADMIN' ORDER BY "createdAt" ASC LIMIT 1;
        IF v_owner IS NULL THEN
            SELECT id INTO v_owner FROM "User" ORDER BY "createdAt" ASC LIMIT 1;
        END IF;

        IF v_owner IS NULL THEN
            -- No users exist yet (fresh DB). Nothing to backfill.
            RETURN;
        END IF;

        v_org := substr(md5(random()::text || clock_timestamp()::text), 1, 25);
        v_ws  := substr(md5(random()::text || clock_timestamp()::text), 1, 25);

        INSERT INTO "Organization" (id, name, slug, "ownerId")
        VALUES (v_org, 'Default Organization', 'default-org', v_owner);

        INSERT INTO "Workspace" (id, name, slug, "organizationId")
        VALUES (v_ws, 'Default Workspace', 'default-workspace', v_org);

        -- 2) Map each existing user into a WorkspaceMember.
        --    ADMIN  → ORG_ADMIN, everything else → DEVELOPER.
        INSERT INTO "WorkspaceMember" (id, "workspaceId", "userId", role)
        SELECT
            substr(md5(u.id || random()::text), 1, 25),
            v_ws,
            u.id,
            CASE WHEN u.role = 'ADMIN' THEN 'ORG_ADMIN'::"Role" ELSE 'DEVELOPER'::"Role" END
        FROM "User" u
        WHERE NOT EXISTS (
            SELECT 1 FROM "WorkspaceMember" wm WHERE wm."userId" = u.id AND wm."workspaceId" = v_ws
        );

        -- 3) Point every user's activeWorkspaceId at the default workspace.
        UPDATE "User" SET "activeWorkspaceId" = v_ws WHERE "activeWorkspaceId" IS NULL;

        -- 4) Attach every existing Project to the default workspace.
        UPDATE "Project" SET "workspaceId" = v_ws WHERE "workspaceId" IS NULL;
    END IF;
END $$;
