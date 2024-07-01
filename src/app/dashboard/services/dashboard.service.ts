import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from 'src/assets/environments/environment';
import { UnreadMessages } from '../interfaces/unread-messages.interface';
import { Message } from '../interfaces/message.interface';
import { MessageStatus } from '../interfaces/message-status.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private http = inject(HttpClient);
  readonly url = `${environment.baseUrl}/message`

  constructor() { }

  getUnreadMessageCount(){
    const headers = this.getHeaders();

    return this.http.get<UnreadMessages>(`${this.url}/unread-messages`, { headers}).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

  getMessages(){
    const headers = this.getHeaders();

    return this.http.get<Message[]>(`${this.url}/all`, { headers }).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

  messageHasBeenReaded(id: string){
    const headers = this.getHeaders();
    const messageSatus: MessageStatus = {hasBeenReaded: true};
    return this.http.patch<MessageStatus>(`${this.url}/edit/${id}`,messageSatus, { headers }).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

  getHeaders(){
    const token = localStorage.getItem('token');

    if(!token) {
      return;
    }

    return  new HttpHeaders().set('Authorization',`Bearer ${token}`);
  }

}
