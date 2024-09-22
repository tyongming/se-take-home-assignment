import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',  // Adjust this for production to allow specific origins
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
