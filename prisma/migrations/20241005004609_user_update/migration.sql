/*
  Warnings:

  - You are about to drop the column `tecnico_nome` on the `OS` table. All the data in the column will be lost.
  - Added the required column `tecnico_id` to the `OS` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OS" DROP CONSTRAINT "OS_tecnico_nome_fkey";

-- DropIndex
DROP INDEX "users_nome_key";

-- AlterTable
ALTER TABLE "OS" DROP COLUMN "tecnico_nome",
ADD COLUMN     "tecnico_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OS" ADD CONSTRAINT "OS_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
