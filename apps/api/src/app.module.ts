import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Infrastructure modules (global)
import { DrizzleModule } from './infrastructure/database/drizzle/drizzle.module';
import { FirebaseModule } from './infrastructure/auth/firebase/firebase.module';
import { NodemailerModule } from './infrastructure/email/nodemailer/nodemailer.module';
import { PdfLibModule } from './infrastructure/pdf/pdf-lib/pdf-lib.module';

// Presentation modules
import { ClientesModule } from './presentation/http/clientes/clientes.module';
import { DestinatariosModule } from './presentation/http/destinatarios/destinatarios.module';
import { OrcamentosModule } from './presentation/http/orcamentos/orcamentos.module';
import { EmailModule } from './presentation/http/email/email.module';
import { PdfModule } from './presentation/http/pdf/pdf.module';
import { DashboardModule } from './presentation/http/dashboard/dashboard.module';

// Cross-cutting concerns
import { FirebaseAuthGuard } from './presentation/http/guards/firebase-auth.guard';
import { ResponseTransformInterceptor } from './presentation/http/interceptors/response-transform.interceptor';
import { DomainExceptionFilter } from './presentation/http/filters/domain-exception.filter';
import { AllExceptionsFilter } from './presentation/http/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),

    // Rate limiting global: 60 requisições por minuto por IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),

    // Infraestrutura global
    DrizzleModule,
    FirebaseModule,
    NodemailerModule,
    PdfLibModule,

    // Feature modules
    ClientesModule,
    DestinatariosModule,
    OrcamentosModule,
    EmailModule,
    PdfModule,
    DashboardModule,
  ],
  providers: [
    // Guard global de rate limiting (roda antes da autenticação)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Guard global: todos os endpoints requerem Firebase Auth por padrão
    { provide: APP_GUARD, useClass: FirebaseAuthGuard },
    // Envolve todas as respostas em { success: true, data: ... }
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
    // Captura qualquer exceção não tratada — deve vir antes para que o mais
    // específico (DomainExceptionFilter) tome precedência sobre DomainException
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Mapeia domain exceptions para HTTP status codes corretos
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
  ],
})
export class AppModule {}
