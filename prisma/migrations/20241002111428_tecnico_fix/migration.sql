/*
  Warnings:

  - You are about to drop the `tecnicos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OS" DROP CONSTRAINT "OS_tecnico_nome_fkey";

-- DropForeignKey
ALTER TABLE "authentication_audit" DROP CONSTRAINT "authentication_audit_tecnico_id_fkey";

-- DropTable
DROP TABLE "tecnicos";

-- CreateTable
CREATE TABLE "users" (
    "cpf" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_digest" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "tentativas_de_login" INTEGER NOT NULL DEFAULT 0,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_role" TEXT NOT NULL DEFAULT 'None',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantoes" (
    "id" SERIAL NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "horario_rf" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plantoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocorrencias" (
    "id" SERIAL NOT NULL,
    "plantao_id" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "pm_horario" TIMESTAMP(3),
    "pm_local" TEXT,
    "pm_observacao" TEXT,
    "pm_acao" TEXT,

    CONSTRAINT "ocorrencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlantaoToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nome_key" ON "users"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_PlantaoToUser_AB_unique" ON "_PlantaoToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PlantaoToUser_B_index" ON "_PlantaoToUser"("B");

-- AddForeignKey
ALTER TABLE "authentication_audit" ADD CONSTRAINT "authentication_audit_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OS" ADD CONSTRAINT "OS_tecnico_nome_fkey" FOREIGN KEY ("tecnico_nome") REFERENCES "users"("nome") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_plantao_id_fkey" FOREIGN KEY ("plantao_id") REFERENCES "plantoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlantaoToUser" ADD CONSTRAINT "_PlantaoToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "plantoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlantaoToUser" ADD CONSTRAINT "_PlantaoToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
