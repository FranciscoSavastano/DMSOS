-- CreateTable
CREATE TABLE "Ocurrence_type" (
    "id" SERIAL NOT NULL,
    "ocurrence_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "subtypes" TEXT[],

    CONSTRAINT "Ocurrence_type_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ocurrence_type" ADD CONSTRAINT "Ocurrence_type_ocurrence_id_fkey" FOREIGN KEY ("ocurrence_id") REFERENCES "ocorrencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
