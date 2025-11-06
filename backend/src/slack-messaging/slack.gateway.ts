import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { SlackService } from './slack.service';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification-gateway/notification.gateway';

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
})
@Injectable()
export class SlackGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(SlackGateway.name);

  // presence maps
  private userSockets = new Map<number, Set<string>>(); // userId -> set of socketIds
  private socketUser = new Map<string, number>(); // socketId -> userId
  private userActiveChannel = new Map<number, number | null>(); // userId -> active channel id or null

  constructor(
    private readonly jwtService: JwtService,
    private readonly slackService: SlackService,
    private readonly notificationService: NotificationsService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = (client.handshake.query?.token ??
        client.handshake.auth?.token) as string;
      if (!token) {
        client.disconnect(true);
        return;
      }
      const payload = this.jwtService.verify<{
        sub?: number;
        userId?: number;
        id?: number;
      }>(token);
      const userId = payload.sub ?? payload.userId ?? payload.id;
      if (!userId) {
        client.disconnect(true);
        return;
      }

      this.socketUser.set(client.id, userId);
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      const sockets = this.userSockets.get(userId)!;
      sockets.add(client.id);

      // join personal room to receive direct server notifications
      await client.join(`user:${userId}`);

      this.logger.log(`Socket connected: ${client.id} (user ${userId})`);
    } catch (err) {
      this.logger.warn('Socket connection failed auth', err);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUser.get(client.id);
    if (userId) {
      const set = this.userSockets.get(userId);
      if (set) {
        set.delete(client.id);
        if (set.size === 0) {
          this.userSockets.delete(userId);
          this.userActiveChannel.delete(userId);
        }
      }
      this.socketUser.delete(client.id);
      this.logger.log(`Socket disconnected: ${client.id} (user ${userId})`);
    }
  }

  @SubscribeMessage('slack:join')
  async onJoin(
    @MessageBody() data: { channelId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUser.get(client.id);
    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }
    const canAccess = await this.slackService.userCanAccessChannel(
      userId,
      data.channelId,
    );
    if (!canAccess) {
      client.emit('error', { message: 'No access to channel' });
      return;
    }
    await client.join(`channel:${data.channelId}`);
    client.emit('slack:joined', { channelId: data.channelId });
  }

  @SubscribeMessage('slack:leave')
  async onLeave(
    @MessageBody() data: { channelId: number },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`channel:${data.channelId}`);
    client.emit('slack:left', { channelId: data.channelId });
  }

  @SubscribeMessage('slack:setActiveChannel')
  onSetActive(
    @MessageBody() data: { channelId: number | null },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUser.get(client.id);
    if (!userId) return;
    this.userActiveChannel.set(userId, data.channelId ?? null);
  }

  @SubscribeMessage('slack:typing')
  onTyping(
    @MessageBody() data: { channelId: number; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    // broadcast typing to channel
    const userId = this.socketUser.get(client.id);
    if (!userId) return;
    this.server.to(`channel:${data.channelId}`).emit('slack:typing', {
      channelId: data.channelId,
      userId,
      isTyping: !!data.isTyping,
    });
  }

  @SubscribeMessage('slack:message')
  async onMessage(
    @MessageBody() data: { channelId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUser.get(client.id);

    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    // create & persist message
    const message = await this.slackService.createMessage(
      userId,
      data.channelId,
      data.content,
    );
    if (!message) {
      this.logger.error('Failed to create message');
      client.emit('error', { message: 'Failed to create message' });
      return;
    }

    // broadcast to channel room
    client.to(`channel:${data.channelId}`).emit('slack:message', message);

    // notify members not active on this channel
    const memberIds = await this.slackService.getChannelMemberIds(
      data.channelId,
    );
    for (const memberId of memberIds) {
      if (memberId === userId) continue;
      const active = this.userActiveChannel.get(memberId) ?? null;
      if (active !== data.channelId) {
        // create persistent Notification
        try {
          const notif = await this.notificationService.create({
            userId: memberId,
            title: `New message in ${message.channel?.name ?? 'channel'}`,
            message: message.content.slice(0, 200),
            link: `/slack-messaging`,
          });
          // emit socket notification if user online
          if (this.userSockets.has(memberId)) {
            this.server.to(`user:${memberId}`).emit('newNotification', {
              notification: notif,
              channelId: data.channelId,
            });
            this.server.to(`user:${memberId}`).emit('slack:unreadIndicator', {
              channelId: data.channelId,
              unread: true,
            });
          }
        } catch (err) {
          // swallow individual notif errors to keep messaging flow
          this.logger.error('Failed to create notification', err);
        }

        // Save + emit via NotificationGateway
        // const notif = await this.notificationService.create({
        //   userId: memberId,
        //   title: `New message in ${message.channel?.name ?? 'channel'}`,
        //   message: message.content.slice(0, 200),
        //   link: `/slack-messaging`,
        // });

        // 👇 This is the important part
        // this.notificationGateway.sendToUser(memberId, notif);
      }
    }
  }
}
