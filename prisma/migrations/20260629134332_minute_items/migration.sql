/*
  Warnings:

  - You are about to drop the column `content` on the `Minute` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "MinuteItems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minuteId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MinuteItems_minuteId_fkey" FOREIGN KEY ("minuteId") REFERENCES "Minute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Minute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Minute" ("createdAt", "date", "id", "published", "title") SELECT "createdAt", "date", "id", "published", "title" FROM "Minute";
DROP TABLE "Minute";
ALTER TABLE "new_Minute" RENAME TO "Minute";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
