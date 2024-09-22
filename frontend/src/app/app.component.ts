import { Component, OnInit } from '@angular/core';
import { AppService } from './services/app.service';
import { WebSocketService } from './services/web-socket.service';

import * as moment from 'moment';

export enum OrderType {
  Normal = 'Normal',
  VIP = 'VIP',
}

export enum OrderStatus {
  Completed = 1,
  Pending = 2,
  InProgress = 3
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  orders: Orders[] = []
  pendingOrders: Orders[] = []
  completedOrders: Orders[] = []

  totalOrders: number = 0;
  normalOrders: number = 0;
  vipOrders: number = 0;
  totalPendingOrders: number = 0;
  totalCompletedOrders: number = 0;
  activeBots: number = 0;

  OrderType = OrderType;

  constructor(
    private _appService: AppService,
    private _webSocketService: WebSocketService
  ) { }

  ngOnInit() {
    this.getOrdersGroupedByStatus();
    this.getBots();
    this.getStats();

    // Subscribe to WebSocket updates
    this._webSocketService.listenForOrderUpdates().subscribe((updatedOrder) => {
      console.log("ming", updatedOrder);
      this.updateOrderStatus(updatedOrder);
    });
  }

  updateOrderStatus(updatedOrder: any) {
    // console.log(updatedOrder);

    // Convert milliseconds to seconds and round up
    const remainingSeconds = Math.ceil(updatedOrder.remainingTime / 1000);

    // Format the remaining time as 'ss' using Moment.js
    updatedOrder.remainingTime = moment(remainingSeconds * 1000).format('s') + 's';

    // // Update the order in the pending or completed array
    if (updatedOrder.status === OrderStatus.Completed) {

      const index = this.pendingOrders.findIndex(order => order.id === updatedOrder.id);
      if (index !== -1) {
        this.pendingOrders.splice(index, 1);
        this.completedOrders.push(updatedOrder);
      }

    } else {
      const index = this.pendingOrders.findIndex(order => order.id === updatedOrder.id);
      if (index !== -1) {
        this.pendingOrders[index] = updatedOrder;
      } else {
        this.pendingOrders.push(updatedOrder);
      }
    }
  }

  addOrders(type: OrderType) {
    this._appService.addOrder({ type: type }).subscribe((res: any) => {
      console.log(res);
      this.setStats(res.stats);

    });
  }

  getOrders() {
    this._appService.getOrders().subscribe((res: any) => {
      console.log(res);
      this.orders = res.orders;
    });
  }

  getOrdersGroupedByStatus() {
    this._appService.getOrdersGroupedByStatus().subscribe((res: any) => {
      this.pendingOrders = res.pending;
      this.completedOrders = res.complete;
    });
  }

  getStats() {
    this._appService.getOrderStats().subscribe((res: any) => {
      console.log(res);
      this.setStats(res);
    });
  }

  setStats(res: any) {
    this.totalOrders = res.total;
    this.normalOrders = res.normal;
    this.vipOrders = res.vip;
    console.log(res.total);
  }

  trackByOrderId(index: number, order: Orders): number {
    return order.id;  // Use the order's ID as the unique identifier
  }

  addBot() {
    this._appService.addBot({}).subscribe((res: any) => {
      // console.log(res);
      this.getBots();
    });
  }

  deleteBot() {
    this._appService.deleteBot().subscribe((res: any) => {
      console.log(res);
      this.getBots();
      if (this.activeBots > 0) {
        const orderToUpdate = this.pendingOrders.find(order => order.id === res.bot.processingOrderId);
        if (orderToUpdate) {
          orderToUpdate.status = OrderStatus.Pending;
        }
      }
    });
  }

  getBots() {
    this._appService.getBots().subscribe((res: any) => {
      // console.log(res);
      this.activeBots = res.length;
      return res;
    })
  }

  title = 'frontend';
}

export interface Orders {
  id: number;
  type: OrderType;
  status: OrderStatus;
  createdDatetime: Date;
  remainingTime?: number;
}
