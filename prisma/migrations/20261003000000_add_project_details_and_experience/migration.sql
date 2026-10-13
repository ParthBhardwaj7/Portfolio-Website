-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "architecture" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "liveUrl" TEXT,
ADD COLUMN     "problem" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "solution" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "techStack" TEXT;

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "org" TEXT,
    "type" TEXT NOT NULL DEFAULT 'project',
    "description" TEXT NOT NULL,
    "technologies" TEXT,
    "url" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_slug_key" ON "Portfolio"("slug");

