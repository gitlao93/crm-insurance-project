import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyModule } from './agency/agency.module';
import { User } from './user/user.entities';
import { Agency } from './agency/agency.entities';
import { SeedModule } from './seeder/seeder.module';
import { PolicyCategoryModule } from './policy-category/policy-category.module';
import { PolicyPlanModule } from './policy-plan/policy-plan.module';
import { PolicyPlan } from './policy-plan/policy-plan.entities';
import { PolicyCategory } from './policy-category/policy-category.entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      database: 'crm_insurance_project_db',
      entities: [User, Agency, PolicyPlan, PolicyCategory],
      synchronize: true,
      logging: false,
    }),
    UserModule,
    AgencyModule,
    SeedModule,
    PolicyCategoryModule,
    PolicyPlanModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
