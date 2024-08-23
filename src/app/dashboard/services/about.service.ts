import { inject, Injectable } from '@angular/core';
import { environment } from 'src/assets/environments/environment';
import { DashboardService } from './dashboard.service';
import { HttpClient } from '@angular/common/http';
import { AboutItem } from '../interfaces/about interface/about.interface';
import { catchError, of } from 'rxjs';
import { EditAboutItem } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AboutService {

    readonly url = `${environment.baseUrl}/about`
    private dashboardService = inject(DashboardService);
    private http = inject(HttpClient);



    // C.R.U.D
    getAllAboutItems(){
      const headers = this.dashboardService.getHeaders();

      return this.http.get<AboutItem[]>(`${this.url}/admin`, { headers}).pipe(
        catchError((err)=>{return of(undefined)})
      )

    }

    getAboutItem(id:string){
      const headers = this.dashboardService.getHeaders();

      return this.http.get<AboutItem>(`${this.url}/${id}`, { headers}).pipe(
        catchError((err)=>{return of(undefined)})
      )
    }

    postNewAboutItem(AboutItem: AboutItem){
      const headers = this.dashboardService.getHeaders();
      return this.http.post<AboutItem>(`${this.url}/upload`, AboutItem, { headers}).pipe(
        catchError((err)=>{return of(undefined)})
      )
    }

    postAboutItemsImage(id:string, formData: FormData){
      const headers = this.dashboardService.getHeaders();
      return this.http.post<AboutItem>(`${this.url}/uploadImg/${id}`, formData, { headers}).pipe(
        catchError((err)=>{return of(undefined)})
      )
    }

    editAboutItem( id: string, editedEvent: EditAboutItem){
      const headers = this.dashboardService.getHeaders();
      return this.http.patch<EditAboutItem>(`${this.url}/edit/${id}`, editedEvent, { headers}).pipe(
        catchError((err)=>{return of(undefined)})
      )
    }
  }


