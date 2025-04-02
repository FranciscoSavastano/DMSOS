/*
  Warnings:

  - You are about to drop the column `has_cftv` on the `clientes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "has_cftv";

-- CreateTable
CREATE TABLE "authentication_audit_customer" (
    "id" SERIAL NOT NULL,
    "ip_address" TEXT,
    "remote_port" TEXT,
    "browser" TEXT,
    "status" "AUTHENTICATION_STATUS" NOT NULL,
    "cliente_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authentication_audit_customer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "authentication_audit_customer" ADD CONSTRAINT "authentication_audit_customer_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
