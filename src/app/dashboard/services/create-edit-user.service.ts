import { inject, Injectable } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/assets/environments/environment';
import { CreateUser, UpdateUser } from '../interfaces';
import { catchError, throwError } from 'rxjs';
import { UserResponse } from '../interfaces/user interface/user-responsee.interface';

@Injectable({
  providedIn: 'root'
})
export class CreateEditUserService {

readonly url = `${environment.baseUrl}/auth`;
private dashboardService = inject(DashboardService);
private http = inject(HttpClient);

getUser(id:string){
  const headers = this.dashboardService.getHeaders();

  return this.http.get<UserResponse>(`${this.url}/user/${id}`, { headers }).pipe(
    catchError((err) => {

      const errorCode = err.status;
      console.error('Código de error:', errorCode);
      console.error('Mensaje del error:', err.message);

      return throwError(() => ({
        status: errorCode,
        message: err.message || 'Error desconocido',
        error: err.error,
      }));
    })
  );
}

createNewUser(newUser: CreateUser) {
  const headers = this.dashboardService.getHeaders();

  return this.http.post(`${this.url}/register`, newUser, { headers }).pipe(
    catchError((err) => {

      const errorCode = err.status;
      console.error('Código de error:', errorCode);
      console.error('Mensaje del error:', err.message);

      return throwError(() => ({
        status: errorCode,
        message: err.message || 'Error desconocido',
        error: err.error,
      }));
    })
  );
}

updateUser(id: string, user: UpdateUser) {
  const headers = this.dashboardService.getHeaders();

  return this.http.patch(`${this.url}/update-user/${id}`, user, { headers }).pipe(
    catchError((err) => {

      const errorCode = err.status;
      console.error('Código de error:', errorCode);
      console.error('Mensaje del error:', err.message);

      return throwError(() => ({
        status: errorCode,
        message: err.message || 'Error desconocido',
        error: err.error,
      }));
    })
  );
}

deleteUser(id: string) {
  const headers = this.dashboardService.getHeaders();

  return this.http.delete(`${this.url}/delete-user/${id}`, { headers }).pipe(
    catchError((err) => {

      const errorCode = err.status;
      console.error('Código de error:', errorCode);
      console.error('Mensaje del error:', err.message);

      return throwError(() => ({
        status: errorCode,
        message: err.message || 'Error desconocido',
        error: err.error,
      }));
    })
  );
}

}
