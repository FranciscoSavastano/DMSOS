-- DropForeignKey
ALTER TABLE "plantao_operador" DROP CONSTRAINT "plantao_operador_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "plantao_operador" DROP CONSTRAINT "plantao_operador_plantaoId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "homem_hora" DOUBLE PRECISION DEFAULT 0.0,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "obras" (
    "id" SERIAL NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "gerente_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "termino" TIMESTAMP(3),
    "numproposta" TEXT NOT NULL,
    "disciplinas" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "horas_previstas" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "obras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dia_obras" (
    "id" SERIAL NOT NULL,
    "obra_id" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "termino" TIMESTAMP(3),
    "horas_gastas" DOUBLE PRECISION NOT NULL,
    "supervisor_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Atividade" (
    "id" SERIAL NOT NULL,
    "obra_id" INTEGER NOT NULL,
    "dia_obra_id" INTEGER,
    "interferencia" TEXT,
    "materiais" TEXT
);

-- CreateTable
CREATE TABLE "ProfissionalNaObra" (
    "profissional_id" TEXT NOT NULL,
    "dia_obra_id" INTEGER NOT NULL,

    CONSTRAINT "ProfissionalNaObra_pkey" PRIMARY KEY ("profissional_id","dia_obra_id")
);

-- CreateTable
CREATE TABLE "ProfissionalNaAtividade" (
    "profissional_id" TEXT NOT NULL,
    "atividade_id" INTEGER NOT NULL,

    CONSTRAINT "ProfissionalNaAtividade_pkey" PRIMARY KEY ("profissional_id","atividade_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dia_obras_id_key" ON "dia_obras"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Atividade_id_key" ON "Atividade"("id");

-- AddForeignKey
ALTER TABLE "plantao_operador" ADD CONSTRAINT "plantao_operador_plantaoId_fkey" FOREIGN KEY ("plantaoId") REFERENCES "plantoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantao_operador" ADD CONSTRAINT "plantao_operador_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obras" ADD CONSTRAINT "obras_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obras" ADD CONSTRAINT "obras_gerente_id_fkey" FOREIGN KEY ("gerente_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dia_obras" ADD CONSTRAINT "dia_obras_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dia_obras" ADD CONSTRAINT "dia_obras_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_dia_obra_id_fkey" FOREIGN KEY ("dia_obra_id") REFERENCES "dia_obras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfissionalNaObra" ADD CONSTRAINT "ProfissionalNaObra_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfissionalNaObra" ADD CONSTRAINT "ProfissionalNaObra_dia_obra_id_fkey" FOREIGN KEY ("dia_obra_id") REFERENCES "dia_obras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfissionalNaAtividade" ADD CONSTRAINT "ProfissionalNaAtividade_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfissionalNaAtividade" ADD CONSTRAINT "ProfissionalNaAtividade_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "Atividade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
