import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';

export enum MessageType {
  OrderUpdate = 0,
  BotUpdate = 1,
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
  },
})
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  // Emit order status updates to the frontend
  sendOrderUpdate(order) {
    this.server.emit('orderStatusUpdate', order);
  }

  
}
