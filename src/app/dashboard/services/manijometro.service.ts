import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { environment } from 'src/assets/environments/environment';
import { catchError, of } from 'rxjs';
import { Manijometro } from '../interfaces';
import { ManijometroPool } from '../interfaces/manijometro interfaces/manijometro.interface';

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
        console.error('Error fetching manijometro:', err);
        return of(undefined);
      })
    );
  }

  getOneManijometro(id:string){
    const headers = this.dashboardService.getHeaders();

    return this.http.get<Manijometro>(`${this.url}/game-manijometro/${id}`, { headers }).pipe(
      catchError((err) => {
        console.error('Error fetching manijometro:', err);
        return of(undefined);
      })
    );
  }

  patchOneManijometro(id:string, manijometroPool: ManijometroPool){
    const headers = this.dashboardService.getHeaders();
    return this.http.patch<Manijometro>(`${this.url}/manijometro/${id}`, manijometroPool, { headers}).pipe(
          catchError((err)=>{return of(undefined)})
        )
  }

  splitByUppercase(input: string){
    const text = input.replace(/([A-Z])/g, ' $1').trim();
    return (text.toLocaleLowerCase() === "price quality")? "price / quality" : text;
  }
}
