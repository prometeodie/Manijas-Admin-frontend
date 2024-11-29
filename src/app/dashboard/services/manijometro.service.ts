import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { get } from 'http';
import { DashboardService } from './dashboard.service';
import { environment } from 'src/assets/environments/environment';
import { catchError, of } from 'rxjs';
import { Manijometro } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ManijometroService {
readonly url = `${environment.baseUrl}/boardgames`;
private http = inject(HttpClient);
private dashboardService= inject(DashboardService);

  constructor() { }

  getAllMAnijmetroBoard(){
    const headers = this.dashboardService.getHeaders();

    return this.http.get<Manijometro[]>(`${this.url}/admin-manijometro`, { headers }).pipe(
      catchError((err) => {
        console.error('Error fetching blogs:', err);
        return of(undefined);
      })
    );
  }
}
