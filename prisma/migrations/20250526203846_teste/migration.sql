/*
  Warnings:

  - The `materiais` column on the `atividades` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `checklist` column on the `atividades` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "atividades" DROP COLUMN "materiais",
ADD COLUMN     "materiais" TEXT[],
DROP COLUMN "checklist",
ADD COLUMN     "checklist" TEXT[];
