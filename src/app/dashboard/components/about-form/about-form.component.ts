import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormService } from 'src/app/services/form-validator.service';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';
import { AboutInput, AboutItem, Section } from '../../interfaces';
import { DashboardService } from '../../services/dashboard.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor, EditorConfig } from 'ckeditor5';
import { toolBarConfig } from 'src/app/utils/toolbar-config';
import Swal from 'sweetalert2';
import { AboutService } from '../../services/about.service';

@Component({
  selector: 'about-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, LoadingAnimationComponent, ReactiveFormsModule, CKEditorModule],
  templateUrl: './about-form.component.html',
  styleUrls: ['./about-form.component.scss']
})
export class AboutFormComponent implements  OnInit,OnDestroy{

private fb = inject(FormBuilder);
private dashboardService= inject(DashboardService);
private aboutService= inject(AboutService);
private fvService= inject(FormService);
public editorConfig!:EditorConfig;
private selectedFile: File | null = null;
public uploadingAboutItem: boolean = false;
public Editor = ClassicEditor;
public charCount:number = 0;
public imgSrc:(string | ArrayBuffer)[] = [];
public aboutInputs: AboutInput[] = [
    { name: 'text', placeHolder: 'Escribir un fragmento de la historia Manija', label:'', type: 'textArea', maxLenght: 24 },
    { name: 'img', placeHolder: '', label: 'Seleccionar una imagen', type: 'file', maxLenght:null},
  ];

public myForm = this.fb.group({
    text:                   ['',[Validators.required]],
    publish:                   [false ,[]],
    img:                       [],
  })

  ngOnInit(): void {
    this.editorConfig = toolBarConfig;
    this.editorConfig.placeholder = 'Ingresa un fragmento de la historia Manija!';
    // TODO: para meter data en el editor se usa la propiedad 	this.editorConfig.initialData: 'data...'
 }

  ngOnDestroy(): void {
    this.cleanImg();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.imgSrc = await this.dashboardService.onFileSelected(event);
    this.dashboardService.loadImage(this.imgSrc[0]);
    this.selectedFile = this.dashboardService.returnOneImg(event);
    if(input.files){
      const file = input.files[0];
      const validSize = this.fvService.avoidImgExceedsMaxSize(file.size, 3145728);
      if(validSize){
        this.dashboardService.notificationPopup("error", 'El tamaño del archivo no debe superar los 3 MB.',2000)
          const fileControl = this.myForm.get('img');
          if (fileControl) {
            fileControl.reset();
            this.cleanImg()
          }
        return;
      }
    }
  }

  isValidField(field: string):boolean | null{
    return this.fvService.isValidField(this.myForm,field);
  }

  showError(field: string):string | null{
    return `${this.fvService.showError(this.myForm,field)}`
  }

  cleanImg(){
    this.imgSrc = [];
    this.dashboardService.cleanImgSrc();
  }

  countingChar(event: any){
    this.charCount = this.dashboardService.countingChar(event)
  }

  get currentAboutItem(): AboutItem {
    const formValue = this.myForm.value;

    const newAboutItem: AboutItem = {
      section: 'ABOUT',
      text:        formValue.text!,
      publish: formValue.publish ?? false,
      imgName: ''
    };

    return newAboutItem;
  }

  onSubmit(){
    this.myForm.markAllAsTouched();
    if(this.myForm.invalid) return;
    Swal.fire({
      title: 'Do you want to save a new Warehouse?',
      text: "",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.uploadingAboutItem = true;
        const currentAboutItem = this.currentAboutItem;
    this.aboutService.postNewAboutItem(currentAboutItem).subscribe(
      resp=>{
        if(resp){
          const _id = resp._id;
            const formData = this.dashboardService.formDataToUploadImg(Section.ABOUT, this.selectedFile!)
          if(formData){
              this.aboutService.postAboutItemsImage(_id!, formData).subscribe(imgResp=>{
                if(!imgResp){
                  this.uploadingAboutItem = false
                  this.dashboardService.notificationPopup("error",'El fragmento de historia fue guardado, pero algo salio mal al guardar la/s imagen/es revisa q su formato sea valido :(',3000)
                }
              });
            }
          this.uploadingAboutItem = false
          this.dashboardService.notificationPopup('success','Evento agregado', 2000)
          this.imgSrc = [];
          this.myForm.reset();
          this.cleanImg();
        }else{
          this.uploadingAboutItem = false
          this.dashboardService.notificationPopup("error", 'Algo salio mal :(', 2000)
        }
      }
    );
      }
    })
  }
}
