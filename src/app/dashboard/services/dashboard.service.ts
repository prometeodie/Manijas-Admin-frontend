import { HttpHeaders } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';

import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private _imgSrc = signal<string | ArrayBuffer | null>(null);
  public imgSrc = computed(( )=> this._imgSrc());

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

  async onFileSelected(event: Event): Promise<string | ArrayBuffer | null> {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsDataURL(file);
      });
    } else {
      return null;
    }
  }

  loadImage(img:string | ArrayBuffer | null){
    this._imgSrc.set(img);
  }

  cleanImgSrc(){
    this._imgSrc.set(null);
  }

  onPublicCheckChange(event: Event){
    const input = event.target as HTMLInputElement;
    return input.checked;
  }

}
