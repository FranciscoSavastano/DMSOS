/*
  Warnings:

  - You are about to drop the column `user_id` on the `authentication_audit` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "authentication_audit" DROP CONSTRAINT "authentication_audit_user_id_fkey";

-- AlterTable
ALTER TABLE "authentication_audit" DROP COLUMN "user_id",
ADD COLUMN     "tecnico_id" TEXT;

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "tecnicos" (
    "cpf" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_digest" TEXT NOT NULL,
    "tentativas_de_login" INTEGER NOT NULL DEFAULT 0,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tecnicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "responsavel" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OS" (
    "id" SERIAL NOT NULL,
    "tipo_manutencao" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "sistema" TEXT NOT NULL,
    "tecnico_nome" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "termino" TIMESTAMP(3) NOT NULL,
    "descricao_tarefa" TEXT NOT NULL,
    "anexos" TEXT NOT NULL,

    CONSTRAINT "OS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcas" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "site" TEXT NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipamento" (
    "id" SERIAL NOT NULL,
    "id_os" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "marca_nome" TEXT NOT NULL,
    "cliente_id" INTEGER NOT NULL,

    CONSTRAINT "Equipamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tecnicos_nome_key" ON "tecnicos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tecnicos_email_key" ON "tecnicos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cnpj_key" ON "clientes"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_marca_key" ON "marcas"("marca");

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_id_os_key" ON "Equipamento"("id_os");

-- AddForeignKey
ALTER TABLE "authentication_audit" ADD CONSTRAINT "authentication_audit_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "tecnicos"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OS" ADD CONSTRAINT "OS_tecnico_nome_fkey" FOREIGN KEY ("tecnico_nome") REFERENCES "tecnicos"("nome") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_marca_nome_fkey" FOREIGN KEY ("marca_nome") REFERENCES "marcas"("marca") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_id_os_fkey" FOREIGN KEY ("id_os") REFERENCES "OS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
