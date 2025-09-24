import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS so React can call NestJS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // frontend URL(s)
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips out properties not in DTO
      forbidNonWhitelisted: true, // throws error on extra fields
      transform: true, // transforms payloads to DTO classes
    }),
  );

  await app.listen(3001);
}
bootstrap();
