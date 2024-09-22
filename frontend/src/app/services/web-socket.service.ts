import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private _socket: Socket;


  constructor(
    private _appService: AppService
  ) {
    this._socket = io('http://localhost:3000');
  }

  // Listen for order status updates, including countdown time
  listenForOrderUpdates(): Observable<any> {
    return new Observable((subscriber) => {
      this._socket.on('orderStatusUpdate', (order) => {
        subscriber.next(order);
      });
    });
  }

}
