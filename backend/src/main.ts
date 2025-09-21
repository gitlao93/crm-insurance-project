import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
