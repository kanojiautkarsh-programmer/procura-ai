import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://procura-ai.pages.dev',
      ...(process.env.ADDITIONAL_ORIGINS?.split(',').filter(Boolean) || []),
    ],
    credentials: true,
  });
  app.use(helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }));

  app.useGlobalFilters(new AllExceptionsFilter());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Procura AI API')
      .setDescription('Spend intelligence and procurement operating system')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger docs available at /docs');
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
}
bootstrap();
