import { Component, inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { FormService } from 'src/app/services/form-validator.service';
import { ClassicEditor, EditorConfig } from 'ckeditor5';
import { toolBarConfig } from 'src/app/utils/toolbar-config';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AuthService } from 'src/app/auth/services/auth.service';
import { BlogInput } from '../../interfaces/blogs interfaces/blogs-inputs.interface';
import { BlogsService } from '../../services/blogs.service';
import { Blog, EditBlog, Section } from '../../interfaces';
import { BlogsCategories } from '../../interfaces/blogs interfaces/blog-categories.enum';
import { UnsaveComponent } from '../unsave/unsave.component';
import { finalize, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';

@Component({
  selector: 'blogs-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, LoadingAnimationComponent, ReactiveFormsModule, CKEditorModule, UnsaveComponent],
  templateUrl: './blogs-form.component.html',
  styleUrls: ['./blogs-form.component.scss']
})
export class BlogsFormComponent implements  OnInit,OnDestroy{
  @Input() blogId!: string;
  private fb = inject(FormBuilder);
  private dashboardService= inject(DashboardService);
  private blogsService= inject(BlogsService);
  private authService= inject(AuthService);
  private fvService= inject(FormService);
  private selectedFile: FileList | null = null;
  public initialFormValues!: EditBlog;
  public currentBlog!:Blog;
  public loadingAnimation: boolean = false;
  public options: string[] = ['LMDR'];
  public editorConfig!:EditorConfig;
  public Editor = ClassicEditor;
  public charCount:number = 0;
  public averageCharacters:number = 0;
  public imgSrc:(string | ArrayBuffer)[] = [];
  public imgUrl: string [] = [];
  public aboutInputs: BlogInput[] = [
    { name: 'title',       placeHolder: 'Titulo', label:'', type: 'text', maxLenght: 50,  selectOptions:[]},
    { name: 'subTitle',    placeHolder: 'subtítulo', label:'', type: 'text', maxLenght: 60,  selectOptions:[]},
    { name: 'blogContent', placeHolder: '', label:'', type: 'textArea', maxLenght: null,  selectOptions:[]},
    { name: 'category',    placeHolder: 'Selecciona una categoria:', label:'', type: 'select', maxLenght: null,  selectOptions: this.blogsService.blogsCategories},
    { name: 'writedBy',    placeHolder: 'Seleccione el autor de este Blog:', label:'', type: 'select', maxLenght: null,  selectOptions: this.options},
    { name: 'imgName',         placeHolder: '', label: 'Seleccionar una imagen', type: 'file', maxLenght:null, selectOptions:[]},
  ];

  public myForm = this.fb.group({
    title:       ['',[Validators.required]],
    subTitle:    ['',[]],
    blogContent: ['',[]],
    category:    [BlogsCategories.NONE,[Validators.required]],
    writedBy:    ['',[Validators.required]],
    publish:     [false ,[]],
    imgName:     [''],
  })

  ngOnInit(): void {
    this.getBlog();
    this.editorConfig = toolBarConfig;
    this.editorConfig.placeholder = 'Ingresa el contenido del blog!';
    this.options.unshift(this.authService.currentUser()!.name);
    this.options.unshift(this.authService.currentUser()!.nickname);
    this.initialFormValues = this.myForm.value as EditBlog;
    this.hasFormChanged();
    this.getTextAverageLength();
  }

  ngOnDestroy(): void {
    this.cleanImg();
  }

  getTextAverageLength(){
    this.dashboardService.getTextAverage(Section.BLOGS).subscribe(resp=>{
      (resp)? this.averageCharacters = resp.charactersAverage : this.averageCharacters = 0;
    })
  }

  // Select images
  async onFileSelected(event: Event) {
    if(this.currentBlog && this.currentBlog._id){
          const thereisImg = this.dashboardService.validateImageUploadLimit(this.currentBlog.imgName);
          if(thereisImg){
            this.myForm.get('imgName')?.reset();
            return;
          }
        }

      const input = event.target as HTMLInputElement;
      this.imgSrc = await this.dashboardService.onFileSelected(event);
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

    getBlog(){

      if (!this.blogId) return;

      this.blogsService.getBlog(this.blogId).subscribe((blog) => {
        if (!blog) return;
        this.currentBlog = blog;
        this.updateFormValues(blog);
        this.getImageUrlByScreenSize(blog);
      });
    }

    getImageUrlByScreenSize(blog: Blog){
      (this.dashboardService.screenWidth > 800)?
        this.getImgUrlBlog(blog.imgName):
        this.getImgUrlBlog(blog.imgMobileName);
    }

getImgUrlBlog(image: string) {
this.imgUrl = [];
if (image){
    this.dashboardService.getImgUrl(image, Section.BLOGS).subscribe(resp => {
      if (resp) {
        this.imgUrl.push(resp.signedUrl);
      }
        this.imgSrc = [...this.imgUrl];
    });
  }
}

    isValidField(field: string):boolean | null{
      return this.fvService.isValidField(this.myForm,field);
    }

    showError(field: string):string | null{
      return `${this.fvService.showError(this.myForm,field)}`
    }

    countingChar(event: any){
      this.charCount = this.dashboardService.countingChar(event)
    }

    hasFormChanged(){
      this.myForm.valueChanges.subscribe((formValue) => {
        if(this.blogId){
          const updatedBlog = {
            ...this.currentBlog};
          if(this.myForm.get('imgName')?.pristine){
            formValue.imgName = this.currentBlog.imgName;
          };
          const hasObjectsDifferences = this.dashboardService.areObjectsDifferent(updatedBlog,{...formValue});
          (!hasObjectsDifferences)? this.myForm.markAsPristine() : this.myForm.markAsDirty();
        }else{
          const hasObjectsDifferences = this.dashboardService.areObjectsDifferent(this.initialFormValues,{...formValue});
          (!hasObjectsDifferences)? this.myForm.markAsPristine() : this.myForm.markAsDirty();
        }
      });
    }

    get newBlog(): EditBlog {
      const formValue = this.myForm.value;

      const newBlog: EditBlog = {
        section: Section.BLOGS,
        title:       formValue.title ?? '',
        subTitle:    formValue.subTitle ?? '',
        writedBy:    formValue.writedBy ?? '',
        blogContent: formValue.blogContent ?? '',
        category:    formValue.category ?? BlogsCategories.OTROS,
        imgName:'',
        publish: formValue.publish ?? false,
      };
      return newBlog;
    }

    private updateFormValues(blog: Blog) {
      this.myForm.patchValue({
        title:       blog.title,
        subTitle:    blog.subTitle,
        writedBy:    blog.writedBy,
        blogContent: blog.blogContent,
        category:    blog.category,
        publish:     blog.publish,

    });

  }

    cleanImg(){
      this.imgSrc = [];
      this.myForm.get('imgName')?.reset('');
      this.hasFormChanged();
    }

    private resetForm() {
      this.myForm.reset();
      this.cleanImg();
      this.myForm.reset({ writedBy: "", category:BlogsCategories.NONE });
      this.myForm.get('imgName')?.reset();
      this.myForm.markAsPristine();
      this.selectedFile = null;
      this.getTextAverageLength();
    }

    public downloadData(newBlog:EditBlog){
      const { publish: currentPublish, ...updatedBlog } = { ...this.currentBlog };
      const { publish, ...formData } = this.myForm.value;
      (this.dashboardService.areObjectsDifferent(updatedBlog, formData))?  this.dashboardService.downloadObjectData(newBlog) : null ;
    }

    // Create and Update form
    private createBlog() {
      const newBlog = this.newBlog;
      this.blogsService.postNewBlog(newBlog).pipe(
        switchMap(resp => {
          if (!resp) {
            this.dashboardService.notificationPopup("error", "Error al crear el Blog", 3000);
            return throwError(() => new Error("Error al crear el Blog"));
          }

          return this.uploadFile(resp._id!).pipe(
            map(imagesUploaded => ({ blogId: resp._id, imagesUploaded }))
          );
        }),
        switchMap(({blogId, imagesUploaded }) => {
          if (!imagesUploaded) {
            this.dashboardService.notificationPopup("error", "Algunas imágenes no se subieron correctamente.", 3000);
          }
          return this.blogsService.getBlog(blogId!);
        }),
        finalize(() => {
          this.loadingAnimation = false;
        })
      ).subscribe((blog) => {
        if (blog) {
          this.uploadFile(blog._id!);
          this.dashboardService.notificationPopup('success','Blog agregado',2000)
          this.resetForm();
          this.getImageUrlByScreenSize(blog);
          this.updateFormValues(blog);
          this.downloadData(newBlog);
        }else{
          this.dashboardService.notificationPopup('error','algo ocurrio al guardar el Blog',2000)
        }
        this.loadingAnimation = false;
      });
    }


    private updateBlog() {

        const { imgName, ...rest} = this.newBlog;

        const actualizedBlog = {
          ...rest,
          section: Section.BLOGS,
        };

      this.blogsService.editBlog(this.blogId, actualizedBlog as EditBlog).pipe(
        switchMap(resp => {
              this.loadingAnimation=true
              if (!resp) {
                this.dashboardService.notificationPopup("error", "Algo salió mal al actualizar el Blog :(", 3000);
                return throwError(() => new Error("Error al actualizar el Blog"));
              }
              return this.uploadFile(this.blogId!);
            }),
            switchMap((imagesUploaded) => {
              if (!imagesUploaded) {
                this.dashboardService.notificationPopup("error", "Algunas imágenes no se subieron correctamente.", 3000);
              }
              return this.blogsService.getBlog(this.blogId);
            }),
            finalize(() => this.loadingAnimation = false)
      ).subscribe((blog) => {
        if (blog) {
          this.dashboardService.notificationPopup('success', 'Blog actualizado correctamente', 2000);
          this.getImageUrlByScreenSize(blog);
          this.downloadData(actualizedBlog);
          this.resetForm()
          this.updateFormValues(blog);
        } else {
          this.dashboardService.notificationPopup("error", 'Algo salió mal al actualizar el Blog :(', 3000);
        }
        this.loadingAnimation = false;
      });
    }

    private uploadFile(eventId: string) :Observable<boolean>{
      if (this.selectedFile == null) {
        console.log("No file selected, upload image canceled.");
        return of(false);
      }
      const uploadTasks: Observable<boolean>[] = [];
      uploadTasks.push(this.uploadImg(eventId, this.selectedFile![0]));
      return uploadTasks.length > 0
            ? forkJoin(uploadTasks).pipe(map(results => results.every(success => success)))
            : of(true);
    }

  uploadImg(id: string, selectedFile: File) {
      if (!id || !selectedFile) {
        this.dashboardService.notificationPopup("error", "Algo salió mal al guardar el Blog :(", 3000);
        return of(false);
      }

      const formData = this.dashboardService.formDataToUploadSingleImg(selectedFile);
      return this.dashboardService.postImage(id, 'blogs/upload-image', formData!).pipe(
        switchMap(resp => {
          if (!resp) {
            this.dashboardService.notificationPopup("error", "El Blog Game fue guardado, pero hubo un error con la imagen.", 3000);
          }
          return of(true);
        }),
        finalize(() => {this.loadingAnimation = false})
      );
    }


  loadImg(event: Event){
    const loadClass = 'blog__form__img-container__img--loaded';
    this.dashboardService.loadImg(event, loadClass)
  }

  // Delete image section
  showDeleteBtn(imgName:  string | ArrayBuffer,imgSrc: string[]): boolean {

    return (imgSrc.includes(imgName.toString()))?true : false;

  }

  private confirmDelete() {
    return this.dashboardService.confirmDelete();
  }

  deleteImg(imgName: string) {
    this.confirmDelete().then((result) => {
      if (!result.isConfirmed) return;
      this.loadingAnimation = true;
      this.deleteImage(this.blogId, imgName);
  })
}

 private deleteImage(boardgameId: string, imgName: string) {
     this.dashboardService.deleteItemImg(boardgameId, Section.BLOGS, imgName, 'delete-image')!.pipe(
       finalize(() => this.loadingAnimation = false)
     ).subscribe(resp => {
       if (resp) {
         this.imgUrl = [];
         this.imgSrc = [];
         this.currentBlog.imgName = '';
         this.dashboardService.notificationPopup('success', 'La imagen se ha eliminado correctamente', 2000);
       } else {
         this.dashboardService.notificationPopup('error', 'No se pudo eliminar la imagen', 2000);
       }
     });
   }

     ///Submit form
     private confirmAction(action: string) {
      return this.dashboardService.confirmAction(action, 'Blog')
    }

    onSubmit() {
      this.myForm.markAllAsTouched();
      if (this.myForm.invalid) return;
      const action = this.currentBlog ? 'update' : 'create';
      this.confirmAction(action).then((result) => {
        if (result.isConfirmed) {
          this.loadingAnimation = true;
          action === 'create' ? this.createBlog() : this.updateBlog();
        }
      });
    }
}

