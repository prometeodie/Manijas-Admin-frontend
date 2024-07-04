import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  getHeaders(){
    const token = localStorage.getItem('token');

    if(!token) {
      return;
    }

    return  new HttpHeaders().set('Authorization',`Bearer ${token}`);
  }

  successPopup(icon:SweetAlertIcon, title:string){
    Swal.fire({
      position: "center",
      icon,
      title,
      showConfirmButton: false,
      timer: 1500
    });
  }
}
