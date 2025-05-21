/*
  Warnings:

  - You are about to drop the column `dia_obra_id` on the `atividades` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "atividades" DROP CONSTRAINT "atividades_dia_obra_id_fkey";

-- DropForeignKey
ALTER TABLE "obras" DROP CONSTRAINT "obras_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "obras" DROP CONSTRAINT "obras_gerente_id_fkey";

-- AlterTable
ALTER TABLE "atividades" DROP COLUMN "dia_obra_id";

-- CreateTable
CREATE TABLE "AtividadeNoDiaObra" (
    "dia_obra_id" INTEGER NOT NULL,
    "atividade_id" INTEGER NOT NULL,

    CONSTRAINT "AtividadeNoDiaObra_pkey" PRIMARY KEY ("dia_obra_id","atividade_id")
);

-- AddForeignKey
ALTER TABLE "obras" ADD CONSTRAINT "obras_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obras" ADD CONSTRAINT "obras_gerente_id_fkey" FOREIGN KEY ("gerente_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtividadeNoDiaObra" ADD CONSTRAINT "AtividadeNoDiaObra_dia_obra_id_fkey" FOREIGN KEY ("dia_obra_id") REFERENCES "dia_obras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtividadeNoDiaObra" ADD CONSTRAINT "AtividadeNoDiaObra_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
