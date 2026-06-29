-- CreateTable
CREATE TABLE "SeedReaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seedId" TEXT NOT NULL,
    "reaction" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SeedReaction_seedId_fkey" FOREIGN KEY ("seedId") REFERENCES "Seed" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
