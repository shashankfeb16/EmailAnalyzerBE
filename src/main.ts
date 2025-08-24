import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend connection
  app.enableCors({
    origin: 'http://localhost:3001', // React app URL
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Email Analyzer Backend running on: http://localhost:${port}`);
  console.log(`📧 Test endpoint: http://localhost:${port}/emails/test-info`);
  console.log(`📋 View emails: http://localhost:${port}/emails`);
}

bootstrap();
