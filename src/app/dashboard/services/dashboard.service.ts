import { HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/assets/environments/environment';
import { HttpClient } from '@angular/common/http';

import Swal, { SweetAlertIcon } from 'sweetalert2';
import { catchError, of } from 'rxjs';
import { Section } from '../shared/enum/section.enum';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  readonly url = `${environment.baseUrl}`
  private http = inject(HttpClient);
  public router = inject(Router);
  private _imgSrc = signal<string | ArrayBuffer | null>(null);
  public imgSrc = computed(( )=> this._imgSrc());
  public screenWidth:number = 0;

  constructor(){
    this.screenWidth = window.innerWidth;
  }

  getHeaders(){
    const token = localStorage.getItem('token');

    if(!token) {
      return;
    }

    return  new HttpHeaders().set('Authorization',`Bearer ${token}`);
  }

  notificationPopup(icon:SweetAlertIcon, title:string){
    Swal.fire({
      position: "center",
      icon,
      title,
      showConfirmButton: false,
      timer: 2000
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

  countingChar(event: any) {
    const editorContent = event.editor.getData();  // Obtiene el contenido del editor
    const textContent = this.stripHtml(editorContent);
    return textContent.length;
  }

  stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  returnOneImg(event: Event){
    const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        return input.files[0];
      }
      return null;
  }

  formDataToUploadImg(section: Section, itemName: string, imgFile: File){
    const formData = new FormData();
    if (!imgFile) {
      return;
    }
    formData.append('section',section);
    formData.append('itemName',itemName);
    formData.append('file', imgFile);

    return formData;
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

  deleteItem(id:string, section: string){
    const headers = this.getHeaders();
    return this.http.delete(`${this.url}/${section}/delete/${id}`,{headers}).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

  deleteItemImg(path:string, section: string, ){
    if(!path) return;
    const headers = this.getHeaders();
    return this.http.delete(`${this.url}/${section}/delete/img/upload/${section}/${path}`,{headers}).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }


}
