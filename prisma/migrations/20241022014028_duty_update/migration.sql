/*
  Warnings:

  - You are about to drop the `_PlantaoToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PlantaoToUser" DROP CONSTRAINT "_PlantaoToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlantaoToUser" DROP CONSTRAINT "_PlantaoToUser_B_fkey";

-- DropTable
DROP TABLE "_PlantaoToUser";

-- CreateTable
CREATE TABLE "plantao_operador" (
    "plantaoId" INTEGER NOT NULL,
    "operadorId" TEXT NOT NULL,

    CONSTRAINT "plantao_operador_pkey" PRIMARY KEY ("plantaoId","operadorId")
);

-- AddForeignKey
ALTER TABLE "plantao_operador" ADD CONSTRAINT "plantao_operador_plantaoId_fkey" FOREIGN KEY ("plantaoId") REFERENCES "plantoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantao_operador" ADD CONSTRAINT "plantao_operador_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
