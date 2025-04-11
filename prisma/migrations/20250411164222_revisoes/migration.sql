-- CreateTable
CREATE TABLE "revisoes" (
    "id" SERIAL NOT NULL,
    "plantao_id" INTEGER NOT NULL,
    "cliente_id" TEXT,
    "user_id" TEXT,
    "nomeSolicitante" TEXT NOT NULL,
    "solicitacao" TEXT NOT NULL,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "revisoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "revisoes" ADD CONSTRAINT "revisoes_plantao_id_fkey" FOREIGN KEY ("plantao_id") REFERENCES "plantoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisoes" ADD CONSTRAINT "revisoes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisoes" ADD CONSTRAINT "revisoes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
