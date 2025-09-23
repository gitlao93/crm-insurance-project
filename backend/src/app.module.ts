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
import { LeadModule } from './lead/lead.module';
import { LeadInteractionModule } from './lead-interaction/lead-interaction.module';
import { Lead } from './lead/lead.entities';
import { LeadInteraction } from './lead-interaction/lead-interaction.entities';
import { MessagingModule } from './messaging/messaging.module';
import { ChannelMember } from './messaging/entities/channel-member.entity';
import { Message } from './messaging/entities/message.entity';
import { MessageStatus } from './messaging/entities/message-status.entity';
import { Channel } from './messaging/entities/channel.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      database: 'crm_insurance_project_db',
      entities: [
        User,
        Agency,
        PolicyPlan,
        PolicyCategory,
        Lead,
        LeadInteraction,
        Channel,
        ChannelMember,
        Message,
        MessageStatus,
      ],
      synchronize: true,
      logging: false,
    }),
    UserModule,
    AgencyModule,
    SeedModule,
    PolicyCategoryModule,
    PolicyPlanModule,
    LeadModule,
    LeadInteractionModule,
    MessagingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
