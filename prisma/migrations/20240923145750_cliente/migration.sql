/*
  Warnings:

  - Added the required column `password_digest` to the `clientes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "password_digest" TEXT NOT NULL;
