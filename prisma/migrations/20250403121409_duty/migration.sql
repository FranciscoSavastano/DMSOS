/*
  Warnings:

  - You are about to drop the column `operadoresNome` on the `plantoes` table. All the data in the column will be lost.
  - You are about to drop the `_PlantaoToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PlantaoToUser" DROP CONSTRAINT "_PlantaoToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlantaoToUser" DROP CONSTRAINT "_PlantaoToUser_B_fkey";

-- AlterTable
ALTER TABLE "plantoes" DROP COLUMN "operadoresNome";

-- DropTable
DROP TABLE "_PlantaoToUser";

-- AddForeignKey
ALTER TABLE "plantao_operador" ADD CONSTRAINT "plantao_operador_plantaoId_fkey" FOREIGN KEY ("plantaoId") REFERENCES "plantoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantao_operador" ADD CONSTRAINT "plantao_operador_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
