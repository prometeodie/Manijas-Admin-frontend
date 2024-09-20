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

  notificationPopup(icon:SweetAlertIcon, title:string, timer:number){
    Swal.fire({
      position: "center",
      icon,
      title,
      showConfirmButton: false,
      timer: timer
    });
  }

  async onFileSelected(event: Event): Promise<(string | ArrayBuffer)[]> {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const filePromises: Promise<string | ArrayBuffer>[] = [];

      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const reader = new FileReader();
        const filePromise = new Promise<string | ArrayBuffer>((resolve, reject) => {
          reader.onload = () => {
            resolve(reader.result!);
          };
          reader.onerror = (error) => {
            reject(error);
          };
          reader.readAsDataURL(file);
        });
        filePromises.push(filePromise);
      }

      try {
        const results = await Promise.all(filePromises);
        return results;
      } catch (error) {
        console.error('Error al leer uno o más archivos:', error);
        return [];
      }
    } else {
      return [];
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

  formDataToUploadImg(section: Section, imgFile: File){
    const formData = new FormData();
    if (!imgFile) {
      return;
    }
    formData.append('section',section);
    formData.append('file', imgFile);

    return formData;
  }

  formDataToUploadImgs(section: Section, imgFiles: FileList) {
    const formData = new FormData();

    if (!imgFiles || imgFiles.length === 0) {
      return;
    }

    // Añade la sección
    formData.append('section', section);


    for (let i = 0; i < imgFiles.length; i++) {
      formData.append('files', imgFiles[i]);
    }

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

  saveCurrentUrl(route: string) {
    localStorage.setItem('lastUrl', route);
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
