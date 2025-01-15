import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { environment } from 'src/assets/environments/environment';
import { ChangePassword } from '../interfaces';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';
import { User } from 'src/app/auth/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ControlPanelService {

  readonly url = `${environment.baseUrl}/auth`
  private http = inject(HttpClient);
  private dashboardService  = inject(DashboardService);


  userChangesPassword(passwords: ChangePassword){
    const headers = this.dashboardService.getHeaders()

    return this.http.patch(`${this.url}/change-password`,passwords, {headers}).pipe(
          catchError((err)=>{return of(undefined)})
        );
  }

  getAlUsers(){
    const headers = this.dashboardService.getHeaders()

    return this.http.get<User[]>(`${this.url}/all-users`, {headers}).pipe(
      catchError((err)=>{return of(undefined)})
    );
  }

  public confirmAction(title: string) {
      return Swal.fire({
        title,
        text: "",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
      });
    }


}
