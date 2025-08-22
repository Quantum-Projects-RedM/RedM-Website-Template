-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_forum_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "postMinRole" TEXT NOT NULL DEFAULT 'USER',
    "replyMinRole" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_forum_categories" ("createdAt", "description", "icon", "id", "isActive", "name", "order", "updatedAt") SELECT "createdAt", "description", "icon", "id", "isActive", "name", "order", "updatedAt" FROM "forum_categories";
DROP TABLE "forum_categories";
ALTER TABLE "new_forum_categories" RENAME TO "forum_categories";
CREATE UNIQUE INDEX "forum_categories_name_key" ON "forum_categories"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
