import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notification.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  /**
   * Create a new notification for a specific user.
   * The frontend can call: POST /notifications/:userId
   * with a body { title: string, message?: string }
   */
  @Post(':userId')
  async create(
    @Param('userId') userId: number,
    @Body() body: Omit<CreateNotificationDto, 'userId'>,
  ) {
    return this.service.create({
      userId: Number(userId),
      title: body.title,
      message: body.message,
      link: body.link,
    });
  }

  /**
   * Get all notifications for a specific user.
   * Example: GET /notifications/12
   */
  @Get(':userId')
  async getForUser(@Param('userId') userId: number) {
    return this.service.findByUser(Number(userId));
  }

  /**
   * Mark a specific notification as read/unread.
   * Example: PATCH /notifications/:userId/:id/read
   * Body: { read: true }
   */
  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    await this.service.markAsRead(id);
    return { success: true };
  }

  /**
   * Mark all notifications as read for a specific user.
   * Example: PATCH /notifications/:userId/read-all
   */
  @Patch(':userId/read-all')
  async markAllRead(@Param('userId') userId: number) {
    return this.service.markAllAsRead(Number(userId));
  }

  /**
   * Delete a notification for a user.
   * Example: DELETE /notifications/:userId/:id
   */
  @Delete(':userId/:id')
  async remove(@Param('userId') userId: number, @Param('id') id: number) {
    return this.service.remove(Number(id), Number(userId));
  }
}
