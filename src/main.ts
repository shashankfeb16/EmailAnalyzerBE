import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Email Analyzer Backend running on: http://localhost:${port}`);
  console.log(`📧 Test endpoint: http://localhost:${port}/emails/test-info`);
  console.log(`📋 View emails: http://localhost:${port}/emails`);
}

bootstrap();
