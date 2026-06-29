-- CreateTable
CREATE TABLE "MinuteComments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minuteId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MinuteComments_minuteId_fkey" FOREIGN KEY ("minuteId") REFERENCES "Minute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
