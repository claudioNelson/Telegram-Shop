-- CreateTable
CREATE TABLE "Commission" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "shopId" INTEGER NOT NULL,
    "orderAmount" INTEGER NOT NULL,
    "commissionPct" DOUBLE PRECISION NOT NULL,
    "commissionAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Commission_orderId_key" ON "Commission"("orderId");

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
