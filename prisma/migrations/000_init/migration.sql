-- Manual migration equivalent to prisma/schema.prisma.
-- Prisma schema-engine failed in this Windows environment, so the local dev.db was created with this SQL.

CREATE TABLE "Family" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Member" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "nickname" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "avatarUrl" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Member_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Location" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "photoUrl" TEXT,
  "sketchCoverUrl" TEXT,
  "tags" TEXT NOT NULL DEFAULT '[]',
  "note" TEXT,
  "isFrequent" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Location_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Food" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "locationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "quantity" REAL NOT NULL DEFAULT 1,
  "unit" TEXT NOT NULL DEFAULT '件',
  "expiresAt" DATETIME NOT NULL,
  "datePhotoUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "source" TEXT NOT NULL DEFAULT 'manual',
  "note" TEXT,
  "createdById" TEXT,
  "lastActorId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Food_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Food_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Operation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "foodId" TEXT,
  "actorId" TEXT,
  "type" TEXT NOT NULL,
  "before" TEXT,
  "after" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Operation_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
