import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './notification.entities';
import { User, UserRole } from 'src/user/user.entities';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.repo.create({
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      link: dto.link,
    });
    return this.repo.save(notification);
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number): Promise<void> {
    await this.repo.update(id, { isRead: true });
  }

  async markAllAsRead(userId: number): Promise<{ success: boolean }> {
    await this.repo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('user_id = :userId', { userId })
      .andWhere('isRead = false')
      .execute();
    return { success: true };
  }

  async remove(id: number, userId: number): Promise<{ success: boolean }> {
    const notification = await this.repo.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');

    await this.repo.remove(notification);
    return { success: true };
  }

  async findAgencyAdmin(agencyId: number): Promise<User | null> {
    return await this.userRepo.findOne({
      where: { agencyId, role: UserRole.ADMIN },
    });
  }

  // src/notification/notification.service.ts
  async createChannelMessageNotification(
    userId: number,
    channelId: number,
    title: string,
    message: string,
    link: string,
  ) {
    // 🔎 Check if an unread notification for this channel already exists
    const existing = await this.repo.findOne({
      where: { userId, isRead: false, link },
    });

    if (existing) {
      // Optional: update timestamp or preview text
      existing.message = message.slice(0, 200);
      existing.createdAt = new Date();
      return this.repo.save(existing);
    }

    // Otherwise create new
    const notif = this.repo.create({
      userId,
      title,
      message: message.slice(0, 200),
      link,
    });
    return this.repo.save(notif);
  }

  async markAsReadByLink(userId: number, link: string) {
    await this.repo.update({ userId, link, isRead: false }, { isRead: true });
  }
}
