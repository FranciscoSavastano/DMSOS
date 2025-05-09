/*
  Warnings:

  - You are about to drop the `Atividade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Atividade" DROP CONSTRAINT "Atividade_dia_obra_id_fkey";

-- DropForeignKey
ALTER TABLE "Atividade" DROP CONSTRAINT "Atividade_obra_id_fkey";

-- DropForeignKey
ALTER TABLE "ProfissionalNaAtividade" DROP CONSTRAINT "ProfissionalNaAtividade_atividade_id_fkey";

-- DropTable
DROP TABLE "Atividade";

-- CreateTable
CREATE TABLE "atividades" (
    "id" SERIAL NOT NULL,
    "obra_id" INTEGER NOT NULL,
    "dia_obra_id" INTEGER,
    "inicio" TIMESTAMP(3),
    "termino" TIMESTAMP(3),
    "horas_previstas" DOUBLE PRECISION,
    "horas_gastas" DOUBLE PRECISION,
    "interferencia" TEXT,
    "materiais" TEXT,
    "equipe" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "descricao" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "atividades_id_key" ON "atividades"("id");

-- AddForeignKey
ALTER TABLE "atividades" ADD CONSTRAINT "atividades_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividades" ADD CONSTRAINT "atividades_dia_obra_id_fkey" FOREIGN KEY ("dia_obra_id") REFERENCES "dia_obras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfissionalNaAtividade" ADD CONSTRAINT "ProfissionalNaAtividade_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
