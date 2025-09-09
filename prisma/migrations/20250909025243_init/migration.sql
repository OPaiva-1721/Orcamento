-- CreateTable
CREATE TABLE "public"."Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Destinatario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destinatario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Orcamento" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "formaPagamento" BOOLEAN NOT NULL DEFAULT false,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataTermino" TIMESTAMP(3),
    "clienteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailEnviado" (
    "id" SERIAL NOT NULL,
    "orcamentoId" INTEGER NOT NULL,
    "destinatarioId" INTEGER NOT NULL,
    "dataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Enviado',

    CONSTRAINT "EmailEnviado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StatusHistory" (
    "id" SERIAL NOT NULL,
    "orcamentoId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "dataMudanca" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_OrcamentoDestinatarios" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OrcamentoDestinatarios_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "public"."Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Destinatario_email_clienteId_key" ON "public"."Destinatario"("email", "clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailEnviado_orcamentoId_destinatarioId_key" ON "public"."EmailEnviado"("orcamentoId", "destinatarioId");

-- CreateIndex
CREATE INDEX "StatusHistory_orcamentoId_idx" ON "public"."StatusHistory"("orcamentoId");

-- CreateIndex
CREATE INDEX "_OrcamentoDestinatarios_B_index" ON "public"."_OrcamentoDestinatarios"("B");

-- AddForeignKey
ALTER TABLE "public"."Destinatario" ADD CONSTRAINT "Destinatario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orcamento" ADD CONSTRAINT "Orcamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailEnviado" ADD CONSTRAINT "EmailEnviado_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "public"."Orcamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailEnviado" ADD CONSTRAINT "EmailEnviado_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "public"."Destinatario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StatusHistory" ADD CONSTRAINT "StatusHistory_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "public"."Orcamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OrcamentoDestinatarios" ADD CONSTRAINT "_OrcamentoDestinatarios_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Destinatario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OrcamentoDestinatarios" ADD CONSTRAINT "_OrcamentoDestinatarios_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Orcamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
