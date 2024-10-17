/*
  Warnings:

  - You are about to drop the column `tecnico_id` on the `authentication_audit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "authentication_audit" DROP CONSTRAINT "authentication_audit_tecnico_id_fkey";

-- AlterTable
ALTER TABLE "authentication_audit" DROP COLUMN "tecnico_id",
ADD COLUMN     "user_id" TEXT;

-- AddForeignKey
ALTER TABLE "authentication_audit" ADD CONSTRAINT "authentication_audit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
