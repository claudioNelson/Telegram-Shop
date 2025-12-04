-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "botWelcomeMessage" TEXT NOT NULL DEFAULT 'Welcome to our shop! 🛍',
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "notificationEmail" TEXT,
ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyOnLowStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnOrder" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "product_tiers" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "priceCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_tiers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_tiers" ADD CONSTRAINT "product_tiers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
