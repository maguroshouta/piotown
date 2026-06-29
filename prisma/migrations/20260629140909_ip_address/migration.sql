-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Seed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Seed" ("content", "createdAt", "id", "ipAddress", "kind") SELECT "content", "createdAt", "id", "ipAddress", "kind" FROM "Seed";
DROP TABLE "Seed";
ALTER TABLE "new_Seed" RENAME TO "Seed";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
