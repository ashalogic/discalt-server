import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
enum ReportType {
  room,
  all,
}
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class VoiceRoomGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('Gateway initialized');
  }

  @SubscribeMessage('connect')
  connect(@ConnectedSocket() socket: Socket): void {
    console.log(`${socket.id} has been connected`);
  }

  @SubscribeMessage('reportUsers')
  reportUsers(
    @MessageBody() data: { type: ReportType; roomName?: string },
  ): void {
    console.log(data);
    switch (data.type) {
      case ReportType.all:
        this.reportAll_Fetch();
        break;
      case ReportType.room:
        if (data.roomName !== undefined) {
          this.reportRoom_Fetch();
        }
        break;
    }
  }

  @SubscribeMessage('reportUsersInRoom')
  reportUsersInRoom(): void {
    this.reportRoom_Fetch();
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomName?: string },
  ): void {
    socket.join('2');
    socket.emit('joinRoom return', `${socket.id} joined ${data.roomName}`);
    this.reportRoom_Fetch();
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomName?: string },
  ): void {
    socket.leave('2');
    socket.emit('leaveRoom return', `${socket.id} left ${data.roomName}`);
    this.reportRoom_Fetch();
  }

  @SubscribeMessage('sendNewMessage')
  sendNewMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: string,
  ): void {
    if (socket.rooms.has('2')) {
      console.log(data + 'from' + socket.id);
      console.log(socket.rooms.keys().next().value);
      this.server
        .to('2')
        .emit('newMessageReceived', { user: socket.id, message: data });
    }
  }

  @SubscribeMessage('audioStream')
  audioStream(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: string,
  ): void {
    if (socket.rooms.has('2')) {
      // console.log(data + 'from' + socket.id);
      console.log(socket.id + ' said ...');
      socket.broadcast.to('2').emit('audioStream return', data);
    }
  }

  async reportAll_Fetch() {
    const socket = await this.server.fetchSockets();
    const _sockets = socket.map((x) => x.id);
    console.log(_sockets);
    this.server.emit('reportUsers return', {
      type: `All`,
      users: _sockets,
    });
  }
  async reportRoom_Fetch() {
    const socket = await this.server.in('2').fetchSockets();
    const _sockets = socket.map((x) => x.id);
    console.log(_sockets);
    this.server.emit('reportUsersInRoom return', {
      type: `Room ${1}`,
      users: _sockets,
    });
  }

  // @SubscribeMessage('events')
  // findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
  //   return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
  // }
}
