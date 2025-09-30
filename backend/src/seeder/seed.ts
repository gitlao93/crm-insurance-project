import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { SeedService } from './seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  await seedService.run();

  await app.close();
}
bootstrap().catch((error) => {
  console.error('Error during bootstrap:', error);
});
