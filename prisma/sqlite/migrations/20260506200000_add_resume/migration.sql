CREATE TABLE "resumes" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "userId"     TEXT NOT NULL,
    "templateId" TEXT NOT NULL DEFAULT 'minimal-light',
    "isPublic"   BOOLEAN NOT NULL DEFAULT true,
    "data"       TEXT NOT NULL DEFAULT '{}',
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  DATETIME NOT NULL
);

CREATE UNIQUE INDEX "resumes_userId_key" ON "resumes"("userId");
