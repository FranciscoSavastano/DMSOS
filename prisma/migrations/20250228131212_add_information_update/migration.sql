/*
  Warnings:

  - The `informacoes_adicionais` column on the `plantoes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "plantoes" DROP COLUMN "informacoes_adicionais",
ADD COLUMN     "informacoes_adicionais" JSONB[];
