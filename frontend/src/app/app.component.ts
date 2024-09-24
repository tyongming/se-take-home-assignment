import { Component, OnInit } from '@angular/core';
import { AppService } from './services/app.service';
import { WebSocketService } from './services/web-socket.service';

import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

export enum OrderType {
  Normal = 'Normal',
  VIP = 'VIP',
}

export enum OrderStatus {
  Completed = 1,
  Pending = 2,
  InProgress = 3
}

export enum BotStatus {
  Processing = 1,
  Idle = 0
}

export enum MessageType {
  OrderUpdate = 0,
  BotUpdate = 1,
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
  totalBots: number = 0;
  idleBots: number = 0;
  isLoading: boolean = false;

  OrderType = OrderType;

  constructor(
    private _appService: AppService,
    private _webSocketService: WebSocketService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.getOrdersGroupedByStatus();
    this.getBots();
    this.getStats();

    // Subscribe to WebSocket updates
    this._webSocketService.listenForOrderUpdates().subscribe((updatedOrder) => {
      this.updateOrderStatus(updatedOrder);
    });

    this.openSnackBar('Welcome to the Order Management System', 2000);
  }

  updateOrderStatus(updatedOrder: any) {
    // console.log(updatedOrder);

    if (updatedOrder?.totalBots != null) {
      this.totalBots = updatedOrder.totalBots;
    }

    if (updatedOrder?.idleBots != null) {
      this.idleBots = updatedOrder.idleBots;
    }

    if (updatedOrder?.removedBotOrder != null) {
      const index = this.pendingOrders.findIndex(order => order.id === updatedOrder.removedBotOrder.id);
      if (index !== -1) {
        this.pendingOrders[index].status = updatedOrder.removedBotOrder.status;
      }
    }

    if (updatedOrder.messageType === MessageType.OrderUpdate) {

      if (updatedOrder?.remainingTime != null) {
        // Convert milliseconds to seconds and round up
        const remainingSeconds = Math.ceil(updatedOrder.remainingTime / 1000);
        updatedOrder.remainingTime = `${remainingSeconds}s`;
      }

      const index = this.pendingOrders.findIndex(order => order.id === updatedOrder.id);

      // // Update the order in the pending or completed array
      if (updatedOrder.status === OrderStatus.Completed) {
        if (index !== -1) {
          this.pendingOrders.splice(index, 1);
          this.completedOrders.unshift(updatedOrder); // Add to the beginning of the array
        }

      } else {
        if (index !== -1) {
          this.pendingOrders[index] = updatedOrder;
        } else {
          if (updatedOrder.type === OrderType.VIP) {
            this.insertVipOrder(updatedOrder);
          } else {
            // Add normal order to the end of the array
            this.pendingOrders = [...this.pendingOrders, updatedOrder];
          }
        }
      }
    }
  }

  insertVipOrder(updatedOrder: Orders) {
    // Find the index after the last VIP order
    const lastVipIndex = this.pendingOrders.findIndex(order => order.type !== 'VIP');

    if (lastVipIndex === -1) {
      // If no normal orders, append the VIP order at the end
      this.pendingOrders = [...this.pendingOrders, updatedOrder];
    } else {
      // Insert the VIP order before the first normal order
      this.pendingOrders = [
        ...this.pendingOrders.slice(0, lastVipIndex), // VIP orders before the found position
        updatedOrder, // New VIP order
        ...this.pendingOrders.slice(lastVipIndex) // Orders after the VIP insertion point
      ];
    }
  }

  addOrders(type: OrderType) {
    this.isLoading = true;
    this._appService.addOrder({ type: type }).subscribe((res: any) => {
      // console.log(res);
      if (res) {
        this.isLoading = false;
        this.setStats(res.stats);
      }

    }, (error) => {
      this.isLoading = false;
      this.openSnackBar(error, 5000);
    });
  }

  getOrdersGroupedByStatus() {
    this.isLoading = true;
    this._appService.getOrdersGroupedByStatus().subscribe((res: any) => {
      if (res) {
        this.isLoading = false;
        this.pendingOrders = res.pending;
        // sort in decending order of createdDatetime
        this.completedOrders = res.complete.sort((a: Orders, b: Orders) => {
          return new Date(b.updatedDatetime).getTime() - new Date(a.updatedDatetime).getTime();
        });
      }
    }, (error) => {
      this.isLoading = false;
      this.openSnackBar(error, 5000);
    });
  }

  clearCompletedOrders() {
    this.isLoading = true;
    this._appService.clearCompletedOrders().subscribe((res: any) => {
      if (res) {
        this.isLoading = false;
        // console.log(res);
        this,this.completedOrders = [];
        this.getStats();
        this.openSnackBar(res.message, 2000);
      }
    }, (error) => {
      this.isLoading = false;
      this.openSnackBar(error, 5000);
    });
  }

  getStats() {
    this.isLoading = true;
    this._appService.getOrderStats().subscribe((res: any) => {
      if (res) {
        this.isLoading = false;
        // console.log(res);
        this.setStats(res);
      }
    }, (error) => {
      this.isLoading = false;
      this.openSnackBar(error, 5000);
    })
  }

  setStats(res: any) {
    this.totalOrders = res.total;
    this.normalOrders = res.normal;
    this.vipOrders = res.vip;
    console.log(res.total);
  }

  addBot() {
    this.isLoading = true;
    this._appService.addBot({}).subscribe((res: any) => {
      if (res) {
        this.isLoading = false;
        // console.log(res);
        this.openSnackBar(res.message, 2000);
      }
    }, (error) => {
      this.isLoading = false;
      this.openSnackBar(error, 5000);
    });
  }

  deleteBot() {
    this.isLoading = true;
    this._appService.deleteBot().subscribe((res: any) => {
      if (res) {
        this.isLoading = false;
        // console.log(res);
        this.openSnackBar(res.message, 2000);
      }
    }, (error) => {
      this.isLoading = false;
      this.openSnackBar(error, 5000);
    });
  }

  getBots() {
    this.isLoading = true;
    this._appService.getBots().subscribe((res: any) => {
      if (res) {
        this.isLoading = false;
        // console.log(res);
        this.totalBots = res.length;
        this.idleBots = res.filter((bot: any) => bot.isIdle === true).length;
        return res;
      }
    }, (error) => {
      this.isLoading = false;
      this.openSnackBar(error, 5000);
    });
  }

  openSnackBar(message: string, duration: number) {
    this._snackBar.open(message, '✕', {
      duration: duration,
      panelClass: ['snackbar'],
    });
  }

  title = 'frontend';
}

export interface Orders {
  id: number;
  type: OrderType;
  status: OrderStatus;
  createdDatetime: Date;
  updatedDatetime: Date;
  remainingTime?: number;
}
