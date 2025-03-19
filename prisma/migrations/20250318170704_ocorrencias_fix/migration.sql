/*
  Warnings:

  - Made the column `data` on table `ocorrencias` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ocorrencias" ALTER COLUMN "data" SET NOT NULL,
ALTER COLUMN "data" SET DEFAULT CURRENT_TIMESTAMP;
