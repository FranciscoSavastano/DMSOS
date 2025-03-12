-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "services" TEXT[] DEFAULT ARRAY['Nenhum']::TEXT[];
