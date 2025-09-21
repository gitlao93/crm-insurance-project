import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyModule } from './agency/agency.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      database: 'goodlife_insurance_db',
      entities: [],
      synchronize: true, // ⚠️ disable in prod
      logging: false,
    }),
    UserModule,
    AgencyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
