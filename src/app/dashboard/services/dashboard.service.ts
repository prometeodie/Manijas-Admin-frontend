import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from 'src/assets/environments/environment';
import { UnreadMessages } from '../interfaces/unread-messages.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private http = inject(HttpClient);
  readonly url = environment.baseUrl

  constructor() { }

  getUnreadMessageCount(){
    const token = localStorage.getItem('token');

    if(!token) {
      return;
    }
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`);

    return this.http.get<UnreadMessages>(`${this.url}/message/unread-messages`, { headers }).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

}
