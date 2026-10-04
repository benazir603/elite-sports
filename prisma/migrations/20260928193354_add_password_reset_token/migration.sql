-- CreateTable
CREATE TABLE "passwordresettokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "passwordresettokens_token_key" ON "passwordresettokens"("token");

-- CreateIndex
CREATE INDEX "passwordresettokens_email_idx" ON "passwordresettokens"("email");
