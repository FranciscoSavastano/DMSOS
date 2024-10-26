/*
  Warnings:

  - Added the required column `NS` to the `Equipamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip` to the `Equipamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mac` to the `Equipamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Equipamento" ADD COLUMN     "NS" TEXT NOT NULL,
ADD COLUMN     "ip" TEXT NOT NULL,
ADD COLUMN     "mac" TEXT NOT NULL;
