-- Drop legacy flat Skill table
DROP TABLE IF EXISTS "Skill";

-- CreateTable
CREATE TABLE "SkillCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SkillCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SkillItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkillItem_categoryId_idx" ON "SkillItem"("categoryId");

-- AddForeignKey
ALTER TABLE "SkillItem" ADD CONSTRAINT "SkillItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SkillCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
