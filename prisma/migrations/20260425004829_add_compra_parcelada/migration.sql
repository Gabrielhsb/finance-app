-- CreateTable
CREATE TABLE "CompraParcelada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "valorParcela" REAL NOT NULL,
    "totalParcelas" INTEGER NOT NULL,
    "mesInicio" INTEGER NOT NULL,
    "anoInicio" INTEGER NOT NULL,
    "cartaoId" TEXT,
    "categoriaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompraParcelada_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "Cartao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CompraParcelada_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
