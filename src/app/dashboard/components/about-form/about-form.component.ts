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
import { finalize, forkJoin, map, Observable, of, Subscription, switchMap, throwError } from 'rxjs';

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
private router = inject(Router);
private selectedFile: FileList | null = null;
private aboutItemsSubscriptions: Subscription = new Subscription();
public currentAboutItem!:AboutItem;
public editorConfig!:EditorConfig;
public loadingAnimation: boolean = false;
public Editor = ClassicEditor;
public charCount:number = 0;
public averageCharacters:number = 0;
public initialFormValues!: EditAboutItem;
public imgSrc:(string | ArrayBuffer)[] = [];
public imgUrl:string[] = [];
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
    this.aboutItemsSubscriptions.unsubscribe();
  }

  async onFileSelected(event: Event) {

    if(this.currentAboutItem && this.currentAboutItem._id){
      const thereisImg = this.dashboardService.validateImageUploadLimit( this.currentAboutItem.imgName);
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

  getAboutItem(){

    if (!this.aboutItemId) return;

    const sub = this.aboutService.getAboutItem(this.aboutItemId).subscribe((item) => {
      if (!item) return;
      this.currentAboutItem = item;
      this.updateFormValues(item);
      this.getImageUrlByScreenSize(item);
    });

    this.aboutItemsSubscriptions.add(sub);
  }

     getImageUrlByScreenSize(aboutItem:AboutItem){
      if(aboutItem.imgName){
        const imgUrl = this.dashboardService.getLocalStorageImgUrl(aboutItem._id!, Section.ABOUT);
       if(imgUrl){
         this.imgUrl = [imgUrl];
         this.imgSrc = [...this.imgUrl];
       }else{
         (this.dashboardService.screenWidth > 800)?
           this.getImgUrlAbouteItem(aboutItem.imgName):
           this.getImgUrlAbouteItem(aboutItem.imgMobileName);
       }
      }}

        getImgUrlAbouteItem(image: string) {
        this.imgUrl = [];
        if (image){
            const sub = this.dashboardService.getImgUrl(image, Section.ABOUT).subscribe(resp => {
              if (resp) {
                this.dashboardService.deleteItemFromLocalStorage(this.currentAboutItem._id!, Section.ABOUT);
                this.imgUrl.push(resp.signedUrl);
              }
                this.imgSrc = [...this.imgUrl];
                (this.dashboardService.screenWidth > 800)?
                                            this.dashboardService.saveImgUrlLocalStorage({_id: this.currentAboutItem._id!, cardCoverImgUrl: resp.signedUrl, urlDate: new Date()}, Section.ABOUT):
                                            this.dashboardService.saveImgUrlLocalStorage({_id: this.currentAboutItem._id!, cardCoverImgUrlMovile: resp.signedUrl, urlDate: new Date()}, Section.ABOUT);
            });
            this.aboutItemsSubscriptions.add(sub);
          }
        }

  getTextAverageLength(){
    const sub = this.dashboardService.getTextAverage(Section.ABOUT).subscribe(resp=>{
      (resp)? this.averageCharacters = resp.charactersAverage : this.averageCharacters = 0;
    })
    this.aboutItemsSubscriptions.add(sub);
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
    const sub = this.myForm.valueChanges.subscribe((formValue) => {
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
    this.aboutItemsSubscriptions.add(sub);
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
      publish:     aboutItem.publish
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
    const sub = this.aboutService.postNewAboutItem(newAboutItem).pipe(
                  switchMap(resp => {
                    this.loadingAnimation = true;
                    if (!resp) {
                      this.dashboardService.notificationPopup("error", "Error al crear el fragmento de historia", 3000);
                      return throwError(() => new Error("Error al crear el fragmento de historia"));
                    }

                    return this.uploadFile(resp._id!).pipe(
                      map(imagesUploaded => ({ aboutItemId: resp._id, imagesUploaded }))
                    );
                  }),
                  switchMap(({aboutItemId, imagesUploaded }) => {
                    if (!imagesUploaded) {
                      this.dashboardService.notificationPopup("error", "Algunas imágenes no se subieron correctamente.", 3000);
                    }
                    return this.aboutService.getAboutItem(aboutItemId!);
                  }),
                  finalize(() => {
                    this.loadingAnimation = false;
                  })
                ).subscribe((aboutItem) => {
      if (aboutItem) {
        this.dashboardService.notificationPopup('success','Item agregado',2000)
        this.resetForm();
        this.router.navigate([`/lmdr/create-edit/ABOUT/${aboutItem._id}`]);
      }else{
        this.dashboardService.notificationPopup('error','algo ocurrio al guardar el fragmento de historia',2000)
      }
    });
    this.loadingAnimation = false;
    this.aboutItemsSubscriptions.add(sub);
  }

  private updateAboutItem() {
    const { imgName, ...rest} = this.newAboutItem;

    const actualizedAboutItem = {
      ...rest,
      section: Section.ABOUT,
    };

    const sub = this.aboutService.editAboutItem(this.aboutItemId, actualizedAboutItem as EditAboutItem)
    .pipe(
      switchMap(resp => {
        this.loadingAnimation = true;
        if (!resp) {
          this.dashboardService.notificationPopup("error", "Algo salió mal al actualizar el fragmento de historia :(", 3000);
          return throwError(() => new Error("Error al actualizar el fragmento de historia"));
        }
        return this.uploadFile(this.aboutItemId!);
      }),
      switchMap((imagesUploaded) => {
        if (!imagesUploaded) {
          this.dashboardService.notificationPopup("error", "Algunas imágenes no se subieron correctamente.", 3000);
        }
        return this.aboutService.getAboutItem(this.aboutItemId);
      }),
      finalize(() => this.loadingAnimation = false)
    ).subscribe((aboutItem) => {
      if (aboutItem) {
        if(this.selectedFile !== null){
          this.uploadFile(this.currentAboutItem._id!);
        }
        this.dashboardService.notificationPopup('success', 'Item actualizado correctamente', 2000);
        this.resetForm();
        this.currentAboutItem = aboutItem;
        this.getImageUrlByScreenSize(aboutItem)
        this.updateFormValues(aboutItem);
      } else {
        this.dashboardService.notificationPopup("error", 'Algo salió mal al actualizar el Item :(', 3000);
      }
      this.loadingAnimation = false;
    });
    this.aboutItemsSubscriptions.add(sub);
  }

  uploadFormData(formData: FormData, _id: string){
    if(formData){
      const sub = this.aboutService.postAboutItemsImage(_id!, formData).subscribe(imgResp=>{

        if(!imgResp){
          this.loadingAnimation = false
          this.dashboardService.notificationPopup("error", 'El Item fue guardado, pero algo salio mal al guardar la/s imagen/es revisa q su formato sea valido :(',3000)
        }
        this.dashboardService.notificationPopup('success','Item agregado',2000)
        this.resetForm()
        this.getAboutItem();
      });
      this.aboutItemsSubscriptions.add(sub);
    }
  }

    private uploadFile(aboutItemID: string) :Observable<boolean>{
        if (this.selectedFile == null) {
          console.log("No file selected, upload image canceled.");
          return of(false);
        }
        const uploadTasks: Observable<boolean>[] = [];
        uploadTasks.push(this.uploadImg(aboutItemID, this.selectedFile![0]));
        return uploadTasks.length > 0
              ? forkJoin(uploadTasks).pipe(map(results => results.every(success => success)))
              : of(true);
      }

    uploadImg(id: string, selectedFile: File) {
        if (!id || !selectedFile) {
          this.dashboardService.notificationPopup("error", "Algo salió mal al guardar el Fragmento de historia :(", 3000);
          return of(false);
        }

        const formData = this.dashboardService.formDataToUploadSingleImg(selectedFile);
        return this.dashboardService.postImage(id, 'about/upload-image', formData!).pipe(
          switchMap(resp => {
            if (!resp) {
              this.dashboardService.notificationPopup("error", "El Fragmento de historia Manija fue guardado, pero hubo un error con la imagen.", 3000);
            }
            return of(true);
          }),
          finalize(() => {this.loadingAnimation = false})
        );
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

     deleteImg(imgName: string) {
        this.confirmDelete().then((result) => {
          if (!result.isConfirmed) return;
          this.loadingAnimation = true;
          this.deleteImage(this.aboutItemId, imgName);
      })
    }

     private deleteImage(boardgameId: string, imgName: string) {
         const sub = this.dashboardService.deleteItemImg(boardgameId, Section.ABOUT, imgName, 'delete-image')!.pipe(
           finalize(() => this.loadingAnimation = false)
         ).subscribe(resp => {
           if (resp) {
             this.imgUrl = [];
             this.imgSrc = [];
             this.currentAboutItem.imgName = '';
             this.dashboardService.deleteItemFromLocalStorage(this.currentAboutItem._id!, Section.ABOUT);
             this.dashboardService.notificationPopup('success', 'La imagen se ha eliminado correctamente', 2000);
           } else {
             this.dashboardService.notificationPopup('error', 'No se pudo eliminar la imagen', 2000);
           }
         });
         this.aboutItemsSubscriptions.add(sub);
       }

       private confirmAction(action: string) {
        return this.dashboardService.confirmAction(action, 'Fragmento de historia Manija');
      }

  onSubmit() {
    this.myForm.markAllAsTouched();
    if (this.myForm.invalid) return;
    const action = this.currentAboutItem ? 'update' : 'create';
    this.confirmAction(action).then((result) => {
      if (result.isConfirmed) {
        this.loadingAnimation = true;
        action === 'create' ? this.createAboutItem() : this.updateAboutItem();
      }
    });
  }
}
