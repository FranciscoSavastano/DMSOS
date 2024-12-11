-- DropForeignKey
ALTER TABLE "plantao_operador" DROP CONSTRAINT "plantao_operador_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "plantao_operador" DROP CONSTRAINT "plantao_operador_plantaoId_fkey";

-- CreateTable
CREATE TABLE "_PlantaoToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PlantaoToUser_AB_unique" ON "_PlantaoToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PlantaoToUser_B_index" ON "_PlantaoToUser"("B");

-- AddForeignKey
ALTER TABLE "_PlantaoToUser" ADD CONSTRAINT "_PlantaoToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "plantoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlantaoToUser" ADD CONSTRAINT "_PlantaoToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
