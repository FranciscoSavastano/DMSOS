-- AlterTable
ALTER TABLE "AtividadeNoDiaObra" ADD COLUMN     "imagens" BYTEA[] DEFAULT ARRAY[]::BYTEA[],
ADD COLUMN     "interferencias" TEXT;
