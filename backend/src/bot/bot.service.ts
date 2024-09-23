import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Bot } from './interfaces/bot.interface';
import { OrdersService } from 'src/orders/orders.service';
import { Order, OrderStatus } from 'src/orders/interfaces/order.interface';
import { MessageType, OrdersGateway } from 'src/websockets/orders/orders.gateway';

@Injectable()
export class BotService {
  private bots: Bot[] = [];
  private idleBots: Bot[] = [];
  private timeouts: { [botId: number]: NodeJS.Timeout } = {};  // A map to track timeouts by bot ID
  private intervals: { [botId: number]: NodeJS.Timeout } = {};
  private idCounter = 1;
  private isAssigning = false;

  constructor(
    @Inject(forwardRef(() => OrdersService)) private readonly ordersService: OrdersService,
    private ordersGateway: OrdersGateway
  ) { }

  create() {
    const newBot: Bot = {
      id: this.idCounter++,
      isIdle: true,
    };

    this.bots.push(newBot);
    this.idleBots.push(newBot);

    console.log(`Bot ${newBot.id} created successfully`);

    this.ordersGateway.sendOrderUpdate({totalBots: this.bots.length ,idleBots: this.idleBots.length, messageType: MessageType.BotUpdate,});

    this.assignOrder();

    return { message: 'Bot created successfully', newBot };
  }

  findAll() {
    return this.bots;
  }

  findOne(id: number) {
    return `This action returns a #${id} bot`;
  }

  // Get count of active bots
  getActiveBotCount() {
    const activeBots = this.idleBots.length;
    return { activeBots };
  }

  async assignOrder() {
    if (this.isAssigning) {
      return;
    }

    this.isAssigning = true;

    try {

      // Loop over idle bots and assign orders
      while (this.idleBots.length > 0 && this.ordersService.getPendingOrders().length > 0) {
        console.log('Assigning order to bot', this.ordersService.getPendingOrders().length);
        const bot = this.idleBots.shift()  // Get the first idle bot

        if (bot) {
          const pendingOrders = this.ordersService.getPendingOrders();  // Get all pending orders
          const orderToProcess = pendingOrders.shift();  // Get the first pending order

          this.processOrder(bot, orderToProcess);  // Assign order to bot and wait for completion
        }

      }

    } finally {
      this.isAssigning = false;
      console.log('Done assigning orders');
    }
  }

  private async processOrder(bot: Bot, order: Order) {
    bot.isIdle = false;
    bot.processingOrderId = order.id;
    const totalTime = 10000;  // 10 seconds processing time
    const startTime = Date.now();

    console.log(`Bot ${bot.id} is processing order ${order.id}`);

    // Update order status to InProgress
    this.ordersService.update(order, OrderStatus.InProgress);

    // Emit order status and remaining time
    this.ordersGateway.sendOrderUpdate({
      ...order,
      remainingTime: totalTime,  // Send the initial remaining time (in seconds)
      idleBots: this.idleBots.length,
      messageType: MessageType.OrderUpdate,
    });

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, totalTime - elapsedTime);

      // Emit the countdown update every second
      this.ordersGateway.sendOrderUpdate({
        ...order,
        remainingTime: remainingTime,  // Remaining time in seconds
        messageType: MessageType.OrderUpdate,
      });

      // Stop the interval when time is up
      if (remainingTime <= 0) {
        clearInterval(interval);
      }
    }, 1000);  // Update every second

    // Store the interval reference
    this.intervals[bot.id] = interval;

    // Store the timeout reference so it can be canceled if the bot is removed
    this.timeouts[bot.id] = setTimeout(async () => {
      // Update order status to Completed
      this.ordersService.update(order, OrderStatus.Completed);
      console.log(`Bot ${bot.id} has completed order ${order.id}`);

      // Update bot status
      bot.processingOrderId = null;
      bot.isIdle = true;

      // Remove the timeout from the map
      delete this.timeouts[bot.id];

      // Add bot back to idle bots
      this.idleBots.push(bot);

      // Notify the frontend that the order is completed
      this.ordersGateway.sendOrderUpdate({...order, idleBots: this.idleBots.length, messageType: MessageType.OrderUpdate,});

      // Try to assign more orders
      this.assignOrder();
    }, 10000);  // Simulate order processing for 10 seconds
  }

  remove() {
    // Get the newest bot
    const bot = this.bots.pop();

    if (!bot) {
      return { message: 'No bot to remove' };
    }

    if (bot.isIdle) {
      this.idleBots = this.idleBots.filter(b => b.id !== bot.id);
      console.log(`Idle bot ${bot.id} has been removed.`);
      this.ordersGateway.sendOrderUpdate({totalBots: this.bots.length ,idleBots: this.idleBots.length, messageType: MessageType.BotUpdate,});
      return { message: `Idle bot ${bot.id} has been removed.`, bot: bot };
    }

    if (!bot.isIdle) {
      if (this.timeouts[bot.id]) {
        // Cancel the order processing
        clearTimeout(this.timeouts[bot.id]);
        delete this.timeouts[bot.id];
      }

      // Cancel the countdown interval
      if (this.intervals[bot.id]) {
        clearInterval(this.intervals[bot.id]);
        delete this.intervals[bot.id];
      }

        // Move the order back to Pending
        const order = this.ordersService.findOne(bot.processingOrderId);
        this.ordersService.update(order, OrderStatus.Pending);

        console.log(`Bot ${bot.id} was removed. Order ${order.id} is now pending.`);

        this.ordersGateway.sendOrderUpdate({removedBotOrder: {id: order.id, status: order.status}, totalBots: this.bots.length, messageType: MessageType.BotUpdate,});

        this.assignOrder();

        return { message: `Bot ${bot.id} was processing an order, and the order ${bot.processingOrderId} has been moved back to pending.`, bot: bot };
      }

      return { message: 'Bot could not be removed' };
    }
  }
