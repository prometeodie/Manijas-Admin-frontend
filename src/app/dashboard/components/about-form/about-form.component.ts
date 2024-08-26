import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';
import { AboutInput } from '../../interfaces';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { FormService } from 'src/app/services/form-validator.service';

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';


@Component({
  selector: 'about-form',
  standalone: true,
  imports: [CommonModule, LoadingAnimationComponent, ReactiveFormsModule, CKEditorModule],
  templateUrl: './about-form.component.html',
  styleUrls: ['./about-form.component.scss']
})
export class AboutFormComponent implements  OnDestroy{

  public editorConfig = {
  toolbar: ['bold', 'italic', 'link', 'undo', 'redo'],
  contentsCss: '\about-form\about-form.component.scss'
};

@ViewChild('txtQuery')
txtQuery!: ElementRef;
private fb = inject(FormBuilder);
private dashboardService= inject(DashboardService);
private fvService= inject(FormService);
public Editor = ClassicEditor;
public charCount:number = 0;
public imgSrc:string | ArrayBuffer | null ='';
public aboutInputs: AboutInput[] = [
    { name: 'textArea', placeHolder: 'Escribir un fragmento de la historia Manija', label:'', type: 'textArea', maxLenght: 24 },
    { name: 'img', placeHolder: '', label: 'Seleccionar una imagen', type: 'file', maxLenght:null},
    { name: 'publish', placeHolder: ':', label: 'Publicar:', type: 'checkbox', maxLenght:null }
  ];

  public myForm = this.fb.group({
    textArea:                   ['',[Validators.required]],
    publish:                   [false ,[Validators.required]],
    img:                       [],
  })


  ngOnDestroy(): void {
    this.cleanImg();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.imgSrc = await this.dashboardService.onFileSelected(event);
    this.dashboardService.loadImage(this.imgSrc);
    if(input.files){
      const file = input.files[0];
      const validSize = this.fvService.avoidImgExceedsMaxSize(file.size, 3145728);
      if(validSize){
        this.dashboardService.notificationPopup("error", 'El tamaño del archivo no debe superar los 3 MB.')
          const fileControl = this.myForm.get('img');
          if (fileControl) {
            fileControl.reset();
            this.cleanImg()
          }
        return;
      }
    }
  }

  cleanImg(){
    this.imgSrc = null;
    this.dashboardService.cleanImgSrc();
  }

  countingChar(event: any){
    this.charCount = this.dashboardService.countingChar(event)
  }

  onSubmit(){
    alert('elemnto cargado')
  }

}
