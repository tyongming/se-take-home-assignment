import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  public serverUrl = environment.LOCAL_URL; // Backend server url
  public apiPath = environment.API_PATH; // API path
  public projectName = environment.PROJECT_NAME;

  timeOut: number = 30 * 1000; // 30 seconds

  constructor(
    private _http: HttpClient
  ) { }

  // Orders API

  addOrder = (body: any): Observable<any> => {
    return this._http.post(`${this.serverUrl}${this.apiPath}/orders/add`, body,).pipe(catchError(this.handleError), timeout(this.timeOut));
  }

  getOrders = (): Observable<any> => {
    return this._http.get(`${this.serverUrl}${this.apiPath}/orders`).pipe(catchError(this.handleError), timeout(this.timeOut));
  }

  getOrdersGroupedByStatus(): Observable<any> {
    return this._http.get(`${this.serverUrl}${this.apiPath}/orders/grouped`).pipe(catchError(this.handleError), timeout(this.timeOut));
  }

  getOrderById = (id: number): Observable<any> => {
    return this._http.get(`${this.serverUrl}${this.apiPath}/orders/${id}`).pipe(catchError(this.handleError), timeout(this.timeOut));
  }

  getOrderStats = (): Observable<any> => {
    return this._http.get(`${this.serverUrl}${this.apiPath}/orders/stats`).pipe(catchError(this.handleError), timeout(this.timeOut));
  }
  
  // Bots API
  
  addBot = (body: any): Observable<any> => {
    return this._http.post(`${this.serverUrl}${this.apiPath}/bots/add`, body).pipe(catchError(this.handleError), timeout(this.timeOut));
  }

  getBots = (): Observable<any> => {
    return this._http.get(`${this.serverUrl}${this.apiPath}/bots`).pipe(catchError(this.handleError), timeout(this.timeOut));
  }

  getBotById = (id: number): Observable<any> => {
    return this._http.get(`${this.serverUrl}${this.apiPath}/bots/${id}`).pipe(catchError(this.handleError), timeout(this.timeOut));
  }

  deleteBot = (): Observable<any> => {
    return this._http.delete(`${this.serverUrl}${this.apiPath}/bots`).pipe(catchError(this.handleError), timeout(this.timeOut));
  }


  // Error handling
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => errorMessage);
  }
}
