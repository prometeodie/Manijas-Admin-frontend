import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/assets/environments/environment';
import { DashboardService } from './dashboard.service';
import { UnreadMessages } from '../interfaces/messages interfaces/unread-messages.interface';
import { catchError, of } from 'rxjs';
import { Message } from '../interfaces/messages interfaces/message.interface';
import { MessageStatus } from '../interfaces/messages interfaces/message-status.interface';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private dashboardService= inject(DashboardService);
  private http = inject(HttpClient);
  readonly url = `${environment.baseUrl}/message`

  constructor() { }

  getUnreadMessageCount(){
    const headers = this.dashboardService.getHeaders();

    return this.http.get<UnreadMessages>(`${this.url}/unread-messages`, { headers}).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

  getMessages(){
    const headers = this.dashboardService.getHeaders();

    return this.http.get<Message[]>(`${this.url}/all`, { headers }).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

  getMessageById(id: string){
    const headers = this.dashboardService.getHeaders();

    return this.http.get<Message>(`${this.url}/${id}`, { headers }).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

  messageHasBeenReaded(id: string){
    const headers = this.dashboardService.getHeaders();
    const messageSatus: MessageStatus = {hasBeenReaded: true};
    return this.http.patch<MessageStatus>(`${this.url}/edit/${id}`,messageSatus, { headers }).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

  deleteMessage(id: string){
    const headers = this.dashboardService.getHeaders();
    return this.http.delete(`${this.url}/delete/${id}`,{headers}).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

}
