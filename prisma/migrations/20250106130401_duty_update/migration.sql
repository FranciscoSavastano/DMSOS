/*
  Warnings:

  - You are about to drop the column `contract` on the `Ocurrence_type` table. All the data in the column will be lost.
  - You are about to drop the column `pm_acao` on the `ocorrencias` table. All the data in the column will be lost.
  - You are about to drop the column `pm_horario` on the `ocorrencias` table. All the data in the column will be lost.
  - You are about to drop the column `pm_local` on the `ocorrencias` table. All the data in the column will be lost.
  - You are about to drop the column `pm_observacao` on the `ocorrencias` table. All the data in the column will be lost.
  - Added the required column `contract_id` to the `Ocurrence_type` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ocurrence_type" DROP COLUMN "contract",
ADD COLUMN     "contract_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ocorrencias" DROP COLUMN "pm_acao",
DROP COLUMN "pm_horario",
DROP COLUMN "pm_local",
DROP COLUMN "pm_observacao",
ADD COLUMN     "acao" TEXT,
ADD COLUMN     "horario" TIMESTAMP(3),
ADD COLUMN     "local" TEXT,
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "responsavel" TEXT,
ADD COLUMN     "termino" TIMESTAMP(3),
ALTER COLUMN "ocurrence_type" SET NOT NULL,
ALTER COLUMN "ocurrence_type" SET DEFAULT 'Padrao',
ALTER COLUMN "ocurrence_type" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Ocurrence_type" ADD CONSTRAINT "Ocurrence_type_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
