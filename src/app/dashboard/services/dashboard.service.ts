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
      timer: 2300
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


  imgPathCreator(imgName: string, screenSize: number, section:Section, id: string) {

    if (imgName.length ===  0) return [];

    return (screenSize < 800)? [`upload/${section}/${id}/optimize/smallS-${imgName}`]:
                        [`upload/${section}/${id}/${imgName}`]
  }

  public confirmAction(action: string, item:string) {
    const title = action === 'create' ? `Quieres guardar un nuevo ${item}?` : `Quieres actualizar el ${item}?`;
    return Swal.fire({
      title,
      text: "",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!'
    });
  }

  public confirmDelete() {
    return Swal.fire({
      title: 'Quieres eliminar la imagen?',
      text: "",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!'
    });
  }

  countingChar(event: any) {
    const editorContent = event.editor.getData();
    const textContent = this.stripHtml(editorContent);
    return textContent.length;
  }

  stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  returnImgs(event: Event){
    const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        return input.files;
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

    formData.append('section', section);


    for (let i = 0; i < imgFiles.length; i++) {
      formData.append('files', imgFiles[i]);
    }

    return formData;
  }

  formDataToUploadSingleImg(section: Section, imgFile: File | null) {
    const formData = new FormData();
    if (!imgFile) {
      return;
    }
    formData.append('section', section);
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

  validateImageUploadLimit( id:string, imgNameLenght:number ){
    if(id){
      if (imgNameLenght !== 0){
        this.notificationPopup("error", 'Solo puede existir una imagen', 3000);
        return true;
      }
      return false;
    }
    return false;
  }

  saveCurrentUrl(route: string) {
    localStorage.setItem('lastUrl', route);
  }

  showDeleteBtn(imgName: string | ArrayBuffer, objectImgName:string, id:string){
    if (!imgName || objectImgName.length === 0) {
      return false;
  }

    if (id.length !== 0) {
      if (typeof imgName === 'string') {
          if (imgName.includes(objectImgName)) {
              return true;
          }
      }
  }

  return false;
  }

  public getImagePaths(imgN: string, id: string) {
    return {
      path: `${id}/${imgN}`,
      optimizePath: `${id}/optimize/smallS-${imgN}`
    };
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
