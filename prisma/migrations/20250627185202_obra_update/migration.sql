/*
  Warnings:

  - You are about to drop the column `equipe` on the `atividades` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AtividadeNoDiaObra" ADD COLUMN     "equipe" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "qtde_concluidos" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "atividades" DROP COLUMN "equipe";

-- AlterTable
ALTER TABLE "dia_obras" ALTER COLUMN "equipe" SET DATA TYPE TEXT[];

-- AlterTable
ALTER TABLE "obras" ALTER COLUMN "equipe" SET DATA TYPE TEXT[];
