-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "batikName" TEXT,
    "category" TEXT,
    "motif" TEXT,
    "originLocation" TEXT NOT NULL,
    "producerName" TEXT,
    "description" TEXT,
    "productionDate" DATETIME NOT NULL,
    "price" REAL,
    "stock" INTEGER,
    "imageUrl" TEXT,
    "detailImageUrl" TEXT,
    "metadataHash" TEXT NOT NULL,
    "certificationDate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "certificateId" TEXT,
    "contractAddress" TEXT,
    "transactionHash" TEXT,
    "producerId" TEXT NOT NULL,
    "onChainTokenId" TEXT,
    "distributorId" TEXT,
    "distributorName" TEXT,
    "distributedAt" DATETIME,
    "distributorTxHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("batikName", "category", "certificateId", "certificationDate", "contractAddress", "createdAt", "description", "detailImageUrl", "id", "imageUrl", "metadataHash", "motif", "originLocation", "price", "producerId", "producerName", "productName", "productionDate", "status", "stock", "tokenId", "transactionHash", "updatedAt") SELECT "batikName", "category", "certificateId", "certificationDate", "contractAddress", "createdAt", "description", "detailImageUrl", "id", "imageUrl", "metadataHash", "motif", "originLocation", "price", "producerId", "producerName", "productName", "productionDate", "status", "stock", "tokenId", "transactionHash", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_tokenId_key" ON "Product"("tokenId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
