-- CreateTable
CREATE TABLE "MinuteReaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minuteId" TEXT NOT NULL,
    "reaction" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MinuteReaction_minuteId_fkey" FOREIGN KEY ("minuteId") REFERENCES "Minute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
