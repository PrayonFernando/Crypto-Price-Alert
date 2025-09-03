-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialStart" DATETIME NOT NULL,
    "trialEnd" DATETIME NOT NULL,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'trial'
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
