/*
  Warnings:

  - You are about to drop the column `kind` on the `Seed` table. All the data in the column will be lost.
  - Added the required column `tags` to the `Seed` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Seed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tags" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Seed" ("content", "createdAt", "id") SELECT "content", "createdAt", "id" FROM "Seed";
DROP TABLE "Seed";
ALTER TABLE "new_Seed" RENAME TO "Seed";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
