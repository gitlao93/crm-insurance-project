import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyModule } from './agency/agency.module';
import { User } from './user/user.entities';
import { Agency } from './agency/agency.entities';
import { SeedModule } from './seeder/seeder.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      database: 'crm_insurance_project_db',
      entities: [User, Agency],
      synchronize: true,
      logging: false,
    }),
    UserModule,
    AgencyModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
