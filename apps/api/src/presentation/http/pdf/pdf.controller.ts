import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PdfLibService } from '../../../infrastructure/pdf/pdf-lib/pdf-lib.service';
import {
  IOrcamentoRepository,
  ORCAMENTO_REPOSITORY,
} from '../../../domain/orcamento/repositories/orcamento.repository.interface';
import { OrcamentoNotFoundException } from '../../../domain/orcamento/exceptions/orcamento-not-found.exception';
import { CurrentUser } from '../decorators/current-user.decorator';
import { DecodedFirebaseToken } from '../../../infrastructure/auth/firebase/firebase-auth.adapter';

@Controller('orcamentos')
export class PdfController {
  constructor(
    private readonly pdfService: PdfLibService,
    @Inject(ORCAMENTO_REPOSITORY)
    private readonly orcamentoRepo: IOrcamentoRepository,
  ) {}

  @Get(':id/pdf')
  async gerarPDF(
    @Param('id', ParseIntPipe) id: number,
    @Query('tipo') tipo: string,
    @CurrentUser() user: DecodedFirebaseToken,
    @Res() res: Response,
  ) {
    const orcamento = await this.orcamentoRepo.findById(id, user.uid);
    if (!orcamento) throw new OrcamentoNotFoundException(id);

    const editavel = tipo === 'editavel';
    const dados = {
      id: orcamento.id,
      descricao: orcamento.descricao,
      preco: orcamento.preco,
      formaPagamento: orcamento.formaPagamento,
      cliente: { nome: orcamento.cliente!.nome },
    };

    const pdfBuffer = editavel
      ? await this.pdfService.gerarPDFEditavel(dados)
      : await this.pdfService.gerarPDF(dados);

    const filename = editavel
      ? `orcamento_editavel_${orcamento.id}.pdf`
      : `orcamento_${orcamento.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  }
}
