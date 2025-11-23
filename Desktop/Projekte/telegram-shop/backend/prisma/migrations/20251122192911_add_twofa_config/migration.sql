-- CreateTable
CREATE TABLE "two_fa_configs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "publicKeyPgp" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "two_fa_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "two_fa_configs_userId_key" ON "two_fa_configs"("userId");

-- AddForeignKey
ALTER TABLE "two_fa_configs" ADD CONSTRAINT "two_fa_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
