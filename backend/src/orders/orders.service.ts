import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus, OrderType } from './interfaces/order.interface';
import { BotService } from 'src/bot/bot.service';
import { MessageType, OrdersGateway } from 'src/websockets/orders/orders.gateway';

@Injectable()
export class OrdersService {
  private orders: Order[] = [];
  private idCounter = 100;

  constructor(
    @Inject(forwardRef(() => BotService)) private readonly botService: BotService,
    private ordersGateway: OrdersGateway
  ) { }

  create(createOrderDto: CreateOrderDto) {
    const newOrder: Order = {
      id: this.idCounter++,
      type: createOrderDto.type,
      status: OrderStatus.Pending,
      createdDatetime: new Date(),
      updatedDatetime: new Date(),
    }

    if (newOrder.type === 'VIP') {
      // Find the index of the last VIP order
      const lastVipIndex = this.orders.map(order => order.type).lastIndexOf(OrderType.VIP);

      // If no VIP order, insert the new VIP order at the beginning
      if (lastVipIndex === -1) {
        this.orders.unshift(newOrder);
      } else {
        // Insert new VIP order after last VIP order
        this.orders.splice(lastVipIndex + 1, 0, newOrder);
      }
    } else {
      this.orders.push(newOrder);
    }

    const { total, normal, vip } = this.getOrderStats();

    this.ordersGateway.sendOrderUpdate({...newOrder, messageType: MessageType.OrderUpdate});

    this.botService.assignOrder();

    return { message: 'Order created successfully', order: newOrder, stats: { total: total, normal: normal, vip: vip } };
  }

  findAll(): Order[] {
    return this.orders;
  }

  findOne(id: number): Order {
    const order = this.orders.find(order => order.id === id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  getOrdersGroupedByStatus(): { pending: Order[], complete: Order[] } {
    const pending = this.orders.filter(order =>
      order.status === OrderStatus.Pending || order.status === OrderStatus.InProgress
    );
    const complete = this.orders.filter(order => order.status === OrderStatus.Completed);

    return { pending, complete };
  }

  getPendingOrders(): Order[] {
    return this.orders.filter(order => order.status === OrderStatus.Pending);
  }

  // Get total orders, normal orders, and VIP orders
  getOrderStats() {
    if (this.orders.length > 0) {
      const totalOrders = this.orders.length;
      const normalOrders = this.orders.filter(order => order.type === OrderType.Normal).length;
      const vipOrders = this.orders.filter(order => order.type === OrderType.VIP).length;

      return { total: totalOrders, normal: normalOrders, vip: vipOrders };
    }


    return { total: 0, normal: 0, vip: 0 };
  }

  update(order: Order, status: OrderStatus) {

    const updateOrder = this.findOne(order.id);

    switch (status) {
      case OrderStatus.Completed:
        if (order.status !== OrderStatus.InProgress) {
          throw new Error('Order cannot be completed unless it is in progress.');
        }
        break;

      case OrderStatus.InProgress:
        if (order.status !== OrderStatus.Pending) {
          throw new Error('Order can only be moved to in progress from pending.');
        }
        break;

      default:
        // Once an order is completed, no further updates should be allowed
        if (order.status === OrderStatus.Completed) {
          throw new Error('Completed orders cannot be updated.');
        }
    }

    updateOrder.status = status;
    updateOrder.updatedDatetime = new Date();

    return { message: 'Order updated successfully', updateOrder };
  }

  clearCompletedOrders() {
    this.orders = this.orders.filter(order => order.status !== OrderStatus.Completed);
    return { message: 'Completed orders cleared successfully' };
  }
}
