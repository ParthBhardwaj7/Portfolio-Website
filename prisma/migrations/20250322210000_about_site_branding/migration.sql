-- AlterTable: add favicon and ogImage to About
ALTER TABLE "About" ADD COLUMN "favicon" TEXT;
ALTER TABLE "About" ADD COLUMN "ogImage" TEXT;
