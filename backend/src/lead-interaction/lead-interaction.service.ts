import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import {
  LeadInteraction,
  InteractionStatus,
} from './lead-interaction.entities';
import { CreateLeadInteractionDto } from './dto/create-lead-interaction.dto';
import { UpdateLeadInteractionDto } from './dto/update-lead-interaction.dto';
import { NotificationsService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification-gateway/notification.gateway';

@Injectable()
export class LeadInteractionService {
  private readonly logger = new Logger(LeadInteractionService.name);

  constructor(
    @InjectRepository(LeadInteraction)
    private leadInteractionRepository: Repository<LeadInteraction>,

    private readonly notificationService: NotificationsService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(dto: CreateLeadInteractionDto): Promise<LeadInteraction> {
    const interaction = this.leadInteractionRepository.create(dto);
    return this.leadInteractionRepository.save(interaction);
  }

  async findAll(leadId: number): Promise<LeadInteraction[]> {
    return this.leadInteractionRepository.find({
      where: { leadId },
      relations: ['lead', 'agent'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<LeadInteraction> {
    const interaction = await this.leadInteractionRepository.findOne({
      where: { id },
      relations: ['lead', 'agent'],
    });
    if (!interaction) throw new NotFoundException('Interaction not found');
    return interaction;
  }

  async update(
    id: number,
    dto: UpdateLeadInteractionDto,
  ): Promise<LeadInteraction> {
    await this.leadInteractionRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.leadInteractionRepository.delete(id);
  }

  async findTodayInteractions(agentId: number): Promise<LeadInteraction[]> {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    return this.leadInteractionRepository.find({
      where: {
        agentId,
        dueDate: Between(start, end),
      },
      relations: ['lead', 'agent'],
      order: { dueDate: 'ASC' },
    });
  }

  // 🕒 CRON JOB: Notify agents about upcoming interactions
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // @Cron('*/10 * * * * *')
  async notifyUpcomingInteractions(): Promise<void> {
    this.logger.log('🔔 Checking for upcoming interactions...');

    const today = startOfDay(new Date());
    const threeDaysFromNow = endOfDay(addDays(today, 3));

    // Get all pending interactions within 3 days (or overdue)
    const interactions = await this.leadInteractionRepository.find({
      where: {
        status: In([InteractionStatus.PENDING, InteractionStatus.RESCHEDULED]),
        dueDate: Between(addDays(today, -3), threeDaysFromNow),
      },
      relations: ['lead', 'agent'],
    });

    for (const interaction of interactions) {
      const agent = interaction.agent;
      if (!agent?.id) continue;

      const dueDate = startOfDay(new Date(interaction.dueDate));
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      let message: string | null = null;

      if (daysUntilDue === 3) {
        message = `You have an upcoming ${interaction.type} with ${interaction.lead?.firstName + ' ' + interaction.lead.lastName || 'a lead'} in 3 days.`;
      } else if (daysUntilDue === 1) {
        message = `Reminder: You have an upcoming ${interaction.type} with ${interaction.lead?.firstName + ' ' + interaction.lead.lastName || 'a lead'} tomorrow.`;
      } else if (daysUntilDue === 0) {
        message = `Reminder: You have a ${interaction.type} with ${interaction.lead?.firstName + ' ' + interaction.lead.lastName || 'a lead'} today.`;
      } else if (daysUntilDue < 0) {
        const overdueDays = Math.abs(daysUntilDue);
        message = `⚠️ Your ${interaction.type} with ${interaction.lead?.firstName + ' ' + interaction.lead.lastName || 'a lead'} is ${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue.`;
      }

      if (message) {
        // Create DB notification
        const notification = await this.notificationService.create({
          userId: agent.id,
          title: 'Lead Interaction Reminder',
          message,
          link: `/lead`,
        });

        // Push via WebSocket
        this.notificationGateway.sendToUser(agent.id, notification);

        this.logger.log(
          `📨 Notified agent ${agent.id} about interaction #${interaction.id}`,
        );
      }
    }

    this.logger.log('✅ Lead interaction reminders check complete.');
  }
}
