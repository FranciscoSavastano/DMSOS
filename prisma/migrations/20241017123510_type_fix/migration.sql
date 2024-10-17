-- DropForeignKey
ALTER TABLE "Ocurrence_type" DROP CONSTRAINT "Ocurrence_type_ocurrence_id_fkey";

-- AlterTable
ALTER TABLE "ocorrencias" ADD COLUMN     "ocurrence_type" TEXT[];
