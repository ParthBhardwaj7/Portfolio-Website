-- AlterTable
ALTER TABLE "About" ADD COLUMN "heroTagline" TEXT;
ALTER TABLE "About" ADD COLUMN "contactCaption" TEXT;

-- Backfill existing rows (one-time)
UPDATE "About"
SET
  "heroTagline" = COALESCE("heroTagline", 'For any queries contact me at parthbhardwaj2579@gmail.com'),
  "contactCaption" = COALESCE("contactCaption", 'For any queries contact me at parthbhardwaj2579@gmail.com');
