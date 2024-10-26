/*
  Warnings:

  - Added the required column `contract` to the `Ocurrence_type` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ocurrence_type" ADD COLUMN     "contract" TEXT NOT NULL;
