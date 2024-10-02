/*
  Warnings:

  - You are about to drop the column `user_type` on the `authentication_audit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "authentication_audit" DROP CONSTRAINT "cliente_user_id_fkey";

-- AlterTable
ALTER TABLE "authentication_audit" DROP COLUMN "user_type";

-- RenameForeignKey
ALTER TABLE "authentication_audit" RENAME CONSTRAINT "tecnico_user_id_fkey" TO "authentication_audit_user_id_fkey";
