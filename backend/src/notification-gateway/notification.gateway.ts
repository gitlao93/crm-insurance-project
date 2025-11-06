import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway {
  @WebSocketServer() server: Server;

  // Called when user connects (frontend)
  handleConnection(client: Socket) {
    console.log('🔔 Notification client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('🔕 Notification client disconnected:', client.id);
  }

  // Each user joins their own room for targeted notifications
  @SubscribeMessage('joinUser')
  async handleJoinUser(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`user_${data.userId}`);
    console.log(`👤 Client ${client.id} joined user_${data.userId}`);
  }

  // Send to one user
  sendToUser(userId: number, notification: any) {
    this.server.to(`user_${userId}`).emit('newNotification', notification);
  }
}
