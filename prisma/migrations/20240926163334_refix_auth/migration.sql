/*
  Warnings:

  - You are about to drop the column `user_id` on the `authentication_audit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "authentication_audit" DROP CONSTRAINT "authentication_audit_user_id_fkey";

-- AlterTable
ALTER TABLE "authentication_audit" DROP COLUMN "user_id",
ADD COLUMN     "tecnico_id" TEXT;

-- DropEnum
DROP TYPE "UserType";

-- AddForeignKey
ALTER TABLE "authentication_audit" ADD CONSTRAINT "authentication_audit_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "tecnicos"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
