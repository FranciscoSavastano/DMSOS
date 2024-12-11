/*
  Warnings:

  - Added the required column `contrato` to the `plantoes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plantoes" ADD COLUMN     "contrato" TEXT NOT NULL;
