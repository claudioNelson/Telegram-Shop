-- CreateEnum
CREATE TYPE "ProductUnit" AS ENUM ('PIECE', 'GRAM', 'KG', 'ML', 'L', 'TABLET', 'PILL', 'BOX', 'PACK');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "unit" "ProductUnit" NOT NULL DEFAULT 'PIECE';
