import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Atrás do Nginx: confia no primeiro proxy para que o throttler use o
  // X-Forwarded-For (IP real do cliente) em vez do IP do proxy.
  app.set('trust proxy', 1);

  // Cabeçalhos de segurança HTTP
  app.use(helmet());

  // Validação global de DTOs via class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS para o frontend Vite
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 API rodando em http://localhost:${port}`);
}
bootstrap();
