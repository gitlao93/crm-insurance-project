import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    // console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('Message received:', data, 'from:', client.id);
    client.broadcast.emit('newMessage', data);
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @MessageBody('channelId') channelId: number,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`channel_${channelId}`);
    console.log(`Client ${client.id} joined channel_${channelId}`);
    return { event: 'joinedChannel', data: { channelId } };
  }

  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(
    @MessageBody() data: { channelId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { channelId } = data;
    await client.leave(`channel_${channelId}`);
    console.log(`Client ${client.id} left channel_${channelId}`);
    return { event: 'leftChannel', data: { channelId } };
  }
}
