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
    if(this.order.status === OrderStatus.Pending || this.order.status === OrderStatus.InProgress) {
      if(!this.activeBots) {
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
  
    if (diffInMinutes < 1) return 'Just now';
    return `${diffInMinutes}m ago`;
  }

}
