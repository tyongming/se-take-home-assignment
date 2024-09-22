import { Timestamp } from "rxjs";

export enum OrderType {
  Normal = 'Normal',
  VIP = 'VIP',
}

export enum OrderStatus {
  Completed = 1,
  Pending = 2,
  InProgress = 3
}

export interface Order {
  id: number;
  type: OrderType;
  status: OrderStatus;
  createdDatetime: Date;
}
