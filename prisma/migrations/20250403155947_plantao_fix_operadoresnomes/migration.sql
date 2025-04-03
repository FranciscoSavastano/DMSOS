/*
  Warnings:

  - You are about to drop the column `operadoresNome` on the `plantoes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plantoes" DROP COLUMN "operadoresNome",
ADD COLUMN     "operadoresNomes" TEXT[];
