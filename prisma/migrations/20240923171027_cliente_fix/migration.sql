/*
  Warnings:

  - Added the required column `nome` to the `clientes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "nome" TEXT NOT NULL;
