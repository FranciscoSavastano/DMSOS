-- AlterTable
ALTER TABLE "AtividadeNoDiaObra" ADD COLUMN     "concluidos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "horas_gastas" DOUBLE PRECISION DEFAULT 0.0;
