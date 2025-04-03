/*
  Warnings:

  - You are about to drop the column `operadoreNome` on the `plantoes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plantoes" DROP COLUMN "operadoreNome",
ADD COLUMN     "operadoresNome" TEXT[];
