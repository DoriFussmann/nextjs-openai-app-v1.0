-- CreateTable
CREATE TABLE "prompts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "checksum" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "prompt_audits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promptId" TEXT NOT NULL,
    "actor" TEXT NOT NULL DEFAULT 'local',
    "changeSummary" TEXT NOT NULL,
    "beforeJson" TEXT NOT NULL,
    "afterJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prompt_audits_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "prompts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "prompts_key_key" ON "prompts"("key");

-- CreateIndex
CREATE INDEX "prompt_audits_promptId_idx" ON "prompt_audits"("promptId");

-- Set SQLite WAL mode and FULL synchronous for atomic writes
PRAGMA journal_mode=WAL;
PRAGMA synchronous=FULL;

