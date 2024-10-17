/*
  Warnings:

  - You are about to drop the column `tecnico_id` on the `authentication_audit` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('TECNICO', 'CLIENTE');

-- DropForeignKey
ALTER TABLE "authentication_audit" DROP CONSTRAINT "authentication_audit_tecnico_id_fkey";

-- AlterTable
ALTER TABLE "authentication_audit" DROP COLUMN "tecnico_id",
ADD COLUMN     "user_id" TEXT,
ADD COLUMN     "user_type" "UserType";

-- AddForeignKey
ALTER TABLE "authentication_audit" ADD CONSTRAINT "tecnico_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tecnicos"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authentication_audit" ADD CONSTRAINT "cliente_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
