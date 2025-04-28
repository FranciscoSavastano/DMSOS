/*
  Warnings:

  - Added the required column `descricao` to the `Atividade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Atividade" ADD COLUMN     "descricao" TEXT NOT NULL,
ADD COLUMN     "equipe" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "horas_gastas" DOUBLE PRECISION,
ADD COLUMN     "horas_previstas" DOUBLE PRECISION,
ADD COLUMN     "inicio" TIMESTAMP(3),
ADD COLUMN     "termino" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "dia_obras" ADD COLUMN     "equipe" JSONB[] DEFAULT ARRAY[]::JSONB[];
