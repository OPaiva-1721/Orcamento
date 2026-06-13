import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IOrcamentoRepository,
  ORCAMENTO_REPOSITORY,
} from '../../../../domain/orcamento/repositories/orcamento.repository.interface';
import {
  IEmailEnviadoRepository,
  EMAIL_ENVIADO_REPOSITORY,
} from '../../../../domain/email/repositories/email-enviado.repository.interface';
import { OrcamentoNotFoundException } from '../../../../domain/orcamento/exceptions/orcamento-not-found.exception';
import { NodemailerEmailService } from '../../../../infrastructure/email/nodemailer/nodemailer-email.service';
import { PdfLibService } from '../../../../infrastructure/pdf/pdf-lib/pdf-lib.service';

export interface SendOrcamentoEmailCommand {
  orcamentoId: number;
  destinatarioIds: number[];
}

export interface EmailResult {
  destinatario: string;
  email: string;
  status: 'enviado' | 'erro';
  error?: string;
}

@Injectable()
export class SendOrcamentoEmailUseCase {
  private readonly logger = new Logger(SendOrcamentoEmailUseCase.name);

  constructor(
    @Inject(ORCAMENTO_REPOSITORY)
    private readonly orcamentoRepo: IOrcamentoRepository,
    @Inject(EMAIL_ENVIADO_REPOSITORY)
    private readonly emailRepo: IEmailEnviadoRepository,
    private readonly emailService: NodemailerEmailService,
    private readonly pdfService: PdfLibService,
  ) {}

  async execute(
    cmd: SendOrcamentoEmailCommand,
    ownerId: string,
  ): Promise<EmailResult[]> {
    const orcamento = await this.orcamentoRepo.findById(
      cmd.orcamentoId,
      ownerId,
    );
    if (!orcamento) throw new OrcamentoNotFoundException(cmd.orcamentoId);

    const destinatarios = (orcamento.destinatarios ?? []).filter((d) =>
      cmd.destinatarioIds.includes(d.id),
    );

    const pdfBuffer = await this.pdfService.gerarPDF({
      id: orcamento.id,
      descricao: orcamento.descricao,
      preco: orcamento.preco,
      formaPagamento: orcamento.formaPagamento,
      cliente: { nome: orcamento.cliente!.nome },
    });

    const results: EmailResult[] = [];

    for (const dest of destinatarios) {
      try {
        this.logger.log(`Enviando email para ${dest.nome} (${dest.email})`);

        const html = this.pdfService.gerarHTMLEmail(
          {
            id: orcamento.id,
            descricao: orcamento.descricao,
            preco: orcamento.preco,
            formaPagamento: orcamento.formaPagamento,
            cliente: { nome: orcamento.cliente!.nome },
            dataInicio: orcamento.dataInicio,
            dataTermino: orcamento.dataTermino,
          },
          { nome: dest.nome },
        );

        await this.emailService.send({
          to: dest.email,
          subject: `Orçamento solicitado - ${this.pdfService.companyName}`,
          html,
          attachments: [
            {
              filename: `orcamento_${orcamento.id}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });

        await this.emailRepo.upsert({
          orcamentoId: orcamento.id,
          destinatarioId: dest.id,
          status: 'Enviado',
        });

        results.push({
          destinatario: dest.nome,
          email: dest.email,
          status: 'enviado',
        });
        this.logger.log(`Email enviado com sucesso para ${dest.email}`);
      } catch (err: any) {
        this.logger.error(
          `Erro ao enviar email para ${dest.email}: ${err.message}`,
        );

        await this.emailRepo.upsert({
          orcamentoId: orcamento.id,
          destinatarioId: dest.id,
          status: 'Falhou',
        });

        results.push({
          destinatario: dest.nome,
          email: dest.email,
          status: 'erro',
          error: err.message,
        });
      }
    }

    return results;
  }
}
