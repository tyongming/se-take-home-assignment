import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as moment from 'moment';
import { OrderStatus, OrderType, Orders } from 'src/app/app.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() order!: Orders;
  @Input() activeBots!: number;

  OrderType = OrderType;
  OrderStatus = OrderStatus;

  headerColor: string = '#BEBEBE';

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    if (this.order.status === OrderStatus.Pending || this.order.status === OrderStatus.InProgress) {
      if (!this.activeBots) {
        this.headerColor = '#FCCABD';
      } else if (this.order.type === OrderType.VIP) {
        this.headerColor = '#f3e0be';
      } else {
        this.headerColor = '#BEBEBE';
      }
    }
  }

  getTimeDifference(createdAt: any): string {
    // Use moment to parse the created date and get the difference in minutes
    const createdMoment = moment(createdAt);
    const now = moment();

    const diffInMinutes = now.diff(createdMoment, 'minutes');
    const diffInHours = now.diff(createdMoment, 'hours');
    const diffInDays = now.diff(createdMoment, 'days');

    if (diffInDays >= 1) {
      return `${diffInDays}d ${diffInHours % 24}h ${diffInMinutes % 60}m ago`;
    } else if (diffInHours >= 1) {
      return `${diffInHours}h ${diffInMinutes % 60}m ago`;
    } else if (diffInMinutes >= 1) {
      return `${diffInMinutes}m ago`;
    } else {
      return 'Just now';
    }
  }

}
