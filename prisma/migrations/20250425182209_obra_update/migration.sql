/*
  Warnings:

  - You are about to drop the column `tipoDia` on the `obras` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "obras" DROP COLUMN "tipoDia",
ADD COLUMN     "tipoDias" TEXT NOT NULL DEFAULT 'Util';
