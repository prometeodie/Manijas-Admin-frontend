import { HttpHeaders, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/assets/environments/environment';
import { HttpClient } from '@angular/common/http';

import Swal, { SweetAlertIcon } from 'sweetalert2';
import { catchError, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { BoardgameUpload, CharacterAverageLenght, EditBlog, SignedImgUrl } from '../interfaces';
import { Section } from '../interfaces/others/sections.enum';
import { read } from 'fs';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  readonly url = `${environment.baseUrl}`
  private http = inject(HttpClient);
  public router = inject(Router);
  public AuthService= inject(AuthService);
  private _imgSrc = signal<string | ArrayBuffer | null>(null);
  public imgSrc = computed(( )=> this._imgSrc());
  private _hasBeenChanged = signal<boolean>(false);
  public hasBeenChanged = computed(( )=> this._hasBeenChanged());
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

  notificationPopupRoulette(title:string, background:string, ){
    const toast = Swal.mixin({
      toast: true,
      background,
      position: "top-end",
      showConfirmButton: false,
      timer: 1200,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });

    toast.fire({
      title
    });
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

  getObjectKeys(obj: any) {
    return Object.keys(obj);
  }

  downloadObjectData(item: BoardgameUpload | EditBlog){
    const itemDataStringify = JSON.stringify(item, null, 2);
    const currentDate  = new Date().toISOString().split('T')[0];

    const blob = new Blob([itemDataStringify], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title}-${currentDate}-backup.json`;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  public hasNonExcludedField(excluded:string[],modifiedFields:Set<string>){

    const excludedFields = excluded;
    const validModifiedFields = [...modifiedFields].filter(field => !excludedFields.includes(field));

    if (validModifiedFields.length === 0) {
      return true;
    }
    return false;
  }

  async onFileSelected(event: Event): Promise<(string | ArrayBuffer)[]> {
    if (!event || !(event.target as HTMLInputElement)) {
      console.warn("El evento no es válido.");
      return [];
    }

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      console.warn("No se seleccionaron archivos.");
      return [];
    }

    const filePromises: Promise<string | ArrayBuffer>[] = [];

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      const reader = new FileReader();

      const filePromise = new Promise<string | ArrayBuffer>((resolve, reject) => {
        reader.onload = () => resolve(reader.result ?? '');
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      filePromises.push(filePromise);
    }

    try {
      const results = await Promise.all(filePromises);
      return results;
    } catch (error) {
      console.error("Error al leer uno o más archivos:", error);
      return [];
    }
  }


  imgPathCreator(imgName: string, screenSize: number, section:Section, id: string) {

    if (imgName.length ===  0) return [];

    if (section === Section.ABOUT){
      return (screenSize < 800)? [`upload/${section}/optimize/${imgName}`]:
                          [`upload/${section}/regular-size/${imgName}`]
    }
    return (screenSize < 800)? [`upload/${section}/${id}/optimize/${imgName}`]:
                        [`upload/${section}/regular-size/${id}/${imgName}`]
  }

areObjectsDifferent(obj1: any, obj2: any): boolean {
  const propertiesToCompare = this.getObjectKeys(obj2).filter(key=>{return key != 'categoryChips'});

  for (const prop of propertiesToCompare) {
    if(obj1[prop] && obj2[prop]){
      let value1 = obj1[prop];
      let value2 = obj2[prop];

      if (typeof value1 === 'string' && typeof value2 === 'string') {
        value1 = value1.trim().replace(/\s+/g, ' ');
        value2 = value2.trim().replace(/\s+/g, ' ');
      }

      if (typeof value1 === 'number' || typeof value2 === 'number') {
        if (Number(value1) !== Number(value2)) {
          return true;
        }
        continue;
      }

      if (typeof value1 === 'boolean' || typeof value2 === 'boolean') {
        if (Boolean(value1) !== Boolean(value2)) {
          return true;
        }
        continue;
      }

      if (Array.isArray(value1) && Array.isArray(value2)) {
        if (JSON.stringify(value1.sort()) !== JSON.stringify(value2.sort())) {
          return true;
        }
        continue;
      }

      if (value1 !== value2) {
        return true;
      }
    }
  }

  return false;
}

testAuthStatus(){
  console.log(this.AuthService.authStatus())
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

  postImage(id:string, section:string, formData: FormData){
      const headers = this.getHeaders();
      return this.http.post(`${this.url}/${section}/${id}`, formData, { headers}).pipe(
        catchError((err)=>{return of(undefined)})
      )
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

  formDataToUploadImgs(imgFiles: FileList) {
    const formData = new FormData();

    if (!imgFiles || imgFiles.length === 0) {
      return;
    }


    for (let i = 0; i < imgFiles.length; i++) {
      formData.append('files', imgFiles[i]);
    }

    return formData;
  }

  formDataToUploadSingleImg(imgFile: File | null) {
    const formData = new FormData();
    if (!imgFile) {
      return;
    }
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

  validateImageUploadLimit( imgName:string ){
      if (imgName){
        this.notificationPopup("error", 'Solo puede existir una imagen', 3000);
        return true;
      }
      return false;
  }

  setHasBeenChanged(value:boolean){
    this._hasBeenChanged.set(value);
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

  getImgUrl(key: string , section: string){

    return this.http.get<SignedImgUrl>(`${this.url}/${section}/img-url`,{
      params: new HttpParams().set('key', key)
    }).pipe(
      catchError((err)=>{
        console.error('Error en la petición:', err);
        return throwError(() => new Error(err.message || 'Error desconocido'));
      })
    )
  }

  getTextAverage(seccion: Section){
    const headers = this.getHeaders();

    return this.http.get<CharacterAverageLenght>(`${this.url}/${seccion}/character-average`,{headers}).pipe(
      catchError((err)=>{
        console.error('Error en la petición:', err);
        return throwError(() => new Error(err.message || 'Error desconocido'));
      })
    )
  }

  public getImagePaths(imgN: string, id: string) {
    return {
      path: `${id}/${imgN}`,
      optimizePath: `${id}/optimize/${imgN}`,
      regularSize: `${id}/regular-size/${imgN}`,
    }
  }

  loadImg(event: Event, loadClass: string){
    const img = event.target as HTMLImageElement;
    img.classList.add(loadClass);
  }

  deleteItem(id:string, section: string){
    const headers = this.getHeaders();
    return this.http.delete(`${this.url}/${section}/delete/${id}`,{headers}).pipe(
      catchError((err)=>{
        console.error('Error en la petición:', err);
        return throwError(() => new Error(err.message || 'Error desconocido'));
      })
    )
  }

deleteItemImg(id: string, section: string, imgKey: string, path: string) {
    if (!id) return;
    const headers = this.getHeaders();
    return this.http.delete(`${this.url}/${section}/${path}/${id}`, {
      headers,
      params: new HttpParams().set('imgKey', imgKey)
    }).pipe(
      catchError((err) => {
        console.error('Error en la petición:', err);
        return throwError(() => new Error(err.message || 'Error desconocido'));
      })
    );
  }
}
