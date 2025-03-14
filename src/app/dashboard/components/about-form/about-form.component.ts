import { Component, inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormService } from 'src/app/services/form-validator.service';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';
import { AboutInput, AboutItem, EditAboutItem, Section } from '../../interfaces';
import { DashboardService } from '../../services/dashboard.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor, EditorConfig } from 'ckeditor5';
import { toolBarConfig } from 'src/app/utils/toolbar-config';
import Swal from 'sweetalert2';
import { AboutService } from '../../services/about.service';
import { Router } from '@angular/router';
import { UnsaveComponent } from '../unsave/unsave.component';

@Component({
  selector: 'about-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, LoadingAnimationComponent, ReactiveFormsModule, CKEditorModule, UnsaveComponent],
  templateUrl: './about-form.component.html',
  styleUrls: ['./about-form.component.scss']
})
export class AboutFormComponent implements  OnInit,OnDestroy{

  @Input() aboutItemId!:string;
private fb = inject(FormBuilder);
private dashboardService = inject(DashboardService);
private aboutService = inject(AboutService);
private fvService = inject(FormService);
private selectedFile: FileList | null = null;
public currentAboutItem!:AboutItem;
public editorConfig!:EditorConfig;
public uploadingAboutItem: boolean = false;
public Editor = ClassicEditor;
public charCount:number = 0;
public averageCharacters:number = 0;
public initialFormValues!: EditAboutItem;
public imgSrc:(string | ArrayBuffer)[] = [];
public aboutInputs: AboutInput[] = [
    { name: 'text', placeHolder: 'Escribir un fragmento de la historia Manija', label:'', type: 'textArea', maxLenght: 24 },
    { name: 'imgName', placeHolder: '', label: 'Seleccionar una imagen', type: 'file', maxLenght:null},
  ];

public myForm = this.fb.group({
    text:                   ['',[Validators.required]],
    publish:                   [false ,[]],
    imgName:                       [''],
  })

  ngOnInit(): void {
    this.getAboutItem();
    this.editorConfig = toolBarConfig;
    this.editorConfig.placeholder = 'Ingresa un fragmento de la historia Manija!';
    this.initialFormValues = this.myForm.value as EditAboutItem;
    this.hasFormChanged();
    this.getTextAverageLength()
  }

  ngOnDestroy(): void {
    this.cleanImg();
  }

  async onFileSelected(event: Event) {

    if(this.currentAboutItem && this.currentAboutItem._id){
      const thereisImg = this.dashboardService.validateImageUploadLimit(this.currentAboutItem._id, this.currentAboutItem.imgName.length);
      if(thereisImg){
        this.myForm.get('imgName')?.reset();
        return;
      }
    }

    const input = event.target as HTMLInputElement;
    this.imgSrc = await this.dashboardService.onFileSelected(event);
    this.dashboardService.loadImage(this.imgSrc[0]);
    this.selectedFile = this.dashboardService.returnImgs(event);
    if(input.files){
      const file = input.files[0];
      const validSize = this.fvService.avoidImgExceedsMaxSize(file.size, 3145728);
      if(validSize){
        this.dashboardService.notificationPopup("error", 'El tamaño del archivo no debe superar los 3 MB.',2000)
          const fileControl = this.myForm.get('imgName');
          if (fileControl) {
            fileControl.reset();
            this.cleanImg()
          }
        return;
      }
    }
  }

  private updateImageSources(event: AboutItem) {
    this.imgSrc = this.dashboardService.imgPathCreator(event.imgName,this.dashboardService.screenWidth, Section.ABOUT, this.aboutItemId);
  }

  getAboutItem(){

    if (!this.aboutItemId) return;

    this.aboutService.getAboutItem(this.aboutItemId).subscribe((item) => {
      if (!item) return;
      this.currentAboutItem = item;
      this.updateFormValues(item);
      this.updateImageSources(item);
    });
  }

  getTextAverageLength(){
    this.dashboardService.getTextAverage(Section.ABOUT).subscribe(resp=>{
      (resp)? this.averageCharacters = resp.charactersAverage : this.averageCharacters = 0;
    })
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
    this.myForm.get('imgName')?.reset('');
    this.hasFormChanged()
  }

  countingChar(event: any){
    this.charCount = this.dashboardService.countingChar(event)
  }

  hasFormChanged(){
    this.myForm.valueChanges.subscribe((formValue) => {
      if(this.aboutItemId){
        const updatedBlog = {
          ...this.currentAboutItem};
        if(this.myForm.get('imgName')?.pristine){
          formValue.imgName = this.currentAboutItem.imgName;
        };
        const hasObjectsDifferences = this.areObjectsDifferent(updatedBlog,{...formValue});
        (!hasObjectsDifferences)? this.myForm.markAsPristine() : this.myForm.markAsDirty();
      }else{
        const hasObjectsDifferences = this.areObjectsDifferent(this.initialFormValues,{...formValue});
        (!hasObjectsDifferences)? this.myForm.markAsPristine() : this.myForm.markAsDirty();
      }
    });
  }

  areObjectsDifferent(itemValue:any, formValue:any) {
    return this.dashboardService.areObjectsDifferent(itemValue,formValue);
  }

  get newAboutItem(): EditAboutItem {
    const formValue = this.myForm.value;

    const newAboutItem: EditAboutItem = {
      section:     Section.ABOUT,
      text:        formValue.text ?? '',
      imgName:     '',
      publish:     formValue.publish ?? false
    };
    return newAboutItem;
  }

  private updateFormValues(aboutItem: AboutItem) {
    this.myForm.patchValue({
      text:        aboutItem.text,
      publish:     true
  });
}
  private resetForm() {
    this.myForm.reset();
    this.cleanImg();
    this.myForm.markAsPristine();
    this.selectedFile = null;
    this.getTextAverageLength();
}
   // Create and Update form
   private createAboutItem() {
    const newAboutItem = this.newAboutItem;
    this.aboutService.postNewAboutItem(newAboutItem).subscribe((resp) => {
      if (resp) {
        this.uploadFile(resp._id!);
        this.resetForm();
        this.dashboardService.notificationPopup('success','Item agregado',2000)
      }else{
        this.dashboardService.notificationPopup('error','algo ocurrio al guardar el Blog',2000)
      }
    });
    this.uploadingAboutItem = false;
  }

  private updateAboutItem() {
    const { imgName, ...rest} = this.newAboutItem;

    const actualizedAboutItem = {
      ...rest,
      section: Section.ABOUT,
    };

    this.aboutService.editAboutItem(this.aboutItemId, actualizedAboutItem as EditAboutItem).subscribe((resp) => {
      if (resp) {
        if(this.selectedFile !== null){
          this.uploadFile(this.currentAboutItem._id!);
        }
        this.dashboardService.notificationPopup('success', 'Item actualizado correctamente', 2000);
        this.resetForm();
        this.getAboutItem();
      } else {
        this.dashboardService.notificationPopup("error", 'Algo salió mal al actualizar el Item :(', 3000);
      }
      this.uploadingAboutItem = false;
    });
  }

  uploadFormData(formData: FormData, _id: string){
    if(formData){
      this.aboutService.postAboutItemsImage(_id!, formData).subscribe(imgResp=>{

        if(!imgResp){
          this.uploadingAboutItem = false
          this.dashboardService.notificationPopup("error", 'El Item fue guardado, pero algo salio mal al guardar la/s imagen/es revisa q su formato sea valido :(',3000)
        }
        this.dashboardService.notificationPopup('success','Item agregado',2000)
        this.resetForm()
        this.getAboutItem();
      });
    }
  }

  private uploadFile(eventId: string) {
    if (this.selectedFile == null) {
      console.log("No file selected, upload image canceled.");
      return;
    }
    this.uploadImg(eventId, Section.BLOGS, this.selectedFile);
  }

  uploadImg(id: string , section:Section, selectedFiles: FileList){

    if(id && selectedFiles){
      const formData = this.dashboardService.formDataToUploadSingleImg(section, selectedFiles![0]);
      if (formData && formData.has('file')) {
        this.uploadFormData(formData!, id);
      }
      this.dashboardService.notificationPopup('success','Item agregado',2000)
    return false;
  }
  else{
    this.dashboardService.notificationPopup("error", 'Algo salio mal al Guardar el Item :(',3000);
    return false;
    }
}

loadImg(event: Event){
  const loadClass = 'about__form__img-container__img--loaded'
  this.dashboardService.loadImg(event, loadClass)
}

// Delete image section
showDeleteBtn(imgName: string | ArrayBuffer, event:AboutItem, id:string){
  if(!event) return false;
  return this.dashboardService.showDeleteBtn(imgName, event.imgName, id)
}

private confirmDelete() {
  return this.dashboardService.confirmDelete();
}

private cleanEventImgName() {
  this.aboutService.editAboutItem(this.currentAboutItem._id!, { imgName:'' }).subscribe((editResp) => {
    if (editResp) {
      this.dashboardService.notificationPopup('success', 'La imagen se ha eliminado correctamente', 2000);
      this.resetForm();
      this.getAboutItem();
    }
  });
}

deleteImg(imgN: string) {
  // this.confirmDelete().then((result) => {
  //   if (!result.isConfirmed) return;
  //   // this.dashboardService.deleteItemImg(imgN, Section.ABOUT)?.subscribe((resp) => {
  //     this.cleanEventImgName();
  //     if (resp) {
  //       // this.dashboardService.deleteItemImg(`/optimize/${imgN}`, Section.ABOUT)?.subscribe();
  //       // this.dashboardService.deleteItemImg(`/regular-size/${imgN}`, Section.ABOUT)?.subscribe();
  //     }else{
  //       this.dashboardService.notificationPopup('error', 'Algo ocurrio al eliminar la imagen', 2000);
  //     }
  //   });
  // });
}

   ///Submit form

   private confirmAction(action: string) {
    return this.dashboardService.confirmAction(action, 'Item')
  }

  onSubmit() {
    this.myForm.markAllAsTouched();
    if (this.myForm.invalid) return;
    const action = this.currentAboutItem ? 'update' : 'create';
    this.confirmAction(action).then((result) => {
      if (result.isConfirmed) {
        this.uploadingAboutItem = true;
        action === 'create' ? this.createAboutItem() : this.updateAboutItem();
      }
    });
  }
}
