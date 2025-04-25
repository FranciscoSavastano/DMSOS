/*
  Warnings:

  - You are about to drop the column `isDiaUtil` on the `obras` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "obras" DROP COLUMN "isDiaUtil",
ADD COLUMN     "equipe" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "tipoDia" TEXT NOT NULL DEFAULT 'Util';
