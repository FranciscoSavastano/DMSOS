-- DropForeignKey
ALTER TABLE "AtividadeNoDiaObra" DROP CONSTRAINT "AtividadeNoDiaObra_atividade_id_fkey";

-- DropForeignKey
ALTER TABLE "AtividadeNoDiaObra" DROP CONSTRAINT "AtividadeNoDiaObra_dia_obra_id_fkey";

-- DropForeignKey
ALTER TABLE "atividades" DROP CONSTRAINT "atividades_obra_id_fkey";

-- DropForeignKey
ALTER TABLE "dia_obras" DROP CONSTRAINT "dia_obras_obra_id_fkey";

-- DropForeignKey
ALTER TABLE "dia_obras" DROP CONSTRAINT "dia_obras_supervisor_id_fkey";

-- AddForeignKey
ALTER TABLE "dia_obras" ADD CONSTRAINT "dia_obras_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dia_obras" ADD CONSTRAINT "dia_obras_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividades" ADD CONSTRAINT "atividades_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtividadeNoDiaObra" ADD CONSTRAINT "AtividadeNoDiaObra_dia_obra_id_fkey" FOREIGN KEY ("dia_obra_id") REFERENCES "dia_obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtividadeNoDiaObra" ADD CONSTRAINT "AtividadeNoDiaObra_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
