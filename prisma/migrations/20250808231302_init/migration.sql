-- CreateTable
CREATE TABLE "public"."Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Destinatario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,

    CONSTRAINT "Destinatario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Orcamento" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataTermino" TIMESTAMP(3) NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "destinatarioId" INTEGER NOT NULL,

    CONSTRAINT "Orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "public"."Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Destinatario_email_key" ON "public"."Destinatario"("email");

-- AddForeignKey
ALTER TABLE "public"."Destinatario" ADD CONSTRAINT "Destinatario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orcamento" ADD CONSTRAINT "Orcamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orcamento" ADD CONSTRAINT "Orcamento_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "public"."Destinatario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
