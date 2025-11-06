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
}
