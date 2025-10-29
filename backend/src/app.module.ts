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
import { AuthModule } from './auth/auth.module';
import { ChatGatewayModule } from './chat-gateway/chat-gateway.module';
import { DirectMessage } from './messaging/entities/direct-message.entity';
import { PolicyHolderModule } from './policy-holder/policy-holder.module';
import { PolicyHolder } from './policy-holder/policy-holder.entities';
import { PolicyDependentModule } from './policy-dependent/policy-dependent.module';
import { PolicyDependent } from './policy-dependent/policy-dependent.entities';
import { DashboardModule } from './dashboard/dashboard.module';
import { SoaModule } from './soa/soa.module';
import { BillingModule } from './billing/billing.module';
import { SOA } from './soa/soa.entities';
import { Billing } from './billing/billing.entities';
import { ScheduleModule } from '@nestjs/schedule';
import { CommissionModule } from './comission/commission.module';
import { Commission } from './comission/commisson.entities';
import { ClaimModule } from './claim/claim.module';
import { Claim } from './claim/claim.entities';
import { QuotaModule } from './quota/quota.module';
import { Quota } from './quota/entities/quota.entity';
import { AgentQuota } from './quota/entities/agent-quota.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'crm',
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
        DirectMessage,
        PolicyHolder,
        PolicyDependent,
        SOA,
        Billing,
        Commission,
        Claim,
        Quota,
        AgentQuota,
      ],
      synchronize: true, //in production change to false
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
    AuthModule,
    ChatGatewayModule,
    PolicyHolderModule,
    PolicyDependentModule,
    DashboardModule,
    SoaModule,
    BillingModule,
    CommissionModule,
    ClaimModule,
    QuotaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
