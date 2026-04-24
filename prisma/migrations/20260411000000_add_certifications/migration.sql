-- CreateTable
CREATE TABLE "Certification" (
    "id"            TEXT NOT NULL,
    "title"         TEXT NOT NULL,
    "issuer"        TEXT NOT NULL,
    "issueDate"     TEXT,
    "imageUrl"      TEXT,
    "pdfUrl"        TEXT,
    "credentialUrl" TEXT,
    "sortOrder"     INTEGER NOT NULL DEFAULT 0,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);
