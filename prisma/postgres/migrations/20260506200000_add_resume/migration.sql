CREATE TABLE "resumes" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "templateId" TEXT NOT NULL DEFAULT 'minimal-light',
    "isPublic"   BOOLEAN NOT NULL DEFAULT true,
    "data"       JSONB NOT NULL DEFAULT '{}',
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,
    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "resumes_userId_key" ON "resumes"("userId");

ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
