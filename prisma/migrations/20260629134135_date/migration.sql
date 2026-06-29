/*
  Warnings:

  - Added the required column `date` to the `Minute` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Minute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Minute" ("content", "createdAt", "id", "published", "title") SELECT "content", "createdAt", "id", "published", "title" FROM "Minute";
DROP TABLE "Minute";
ALTER TABLE "new_Minute" RENAME TO "Minute";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
