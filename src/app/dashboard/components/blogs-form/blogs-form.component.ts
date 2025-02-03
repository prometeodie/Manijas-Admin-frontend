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
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UnsaveComponent } from '../unsave/unsave.component';

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
  public uploadingBlog: boolean = false;
  public options: string[] = ['LMDR'];
  public editorConfig!:EditorConfig;
  public Editor = ClassicEditor;
  public charCount:number = 0;
  public averageCharacters:number = 0;
  public imgSrc:(string | ArrayBuffer)[] = [];
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
    imgName:         [''],
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
          const thereisImg = this.dashboardService.validateImageUploadLimit(this.currentBlog._id, this.currentBlog.imgName.length);
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

    private updateImageSources(event: Blog) {
      this.imgSrc = this.dashboardService.imgPathCreator(event.imgName,this.dashboardService.screenWidth, Section.EVENTS, this.blogId);
    }

    getBlog(){

      if (!this.blogId) return;

      this.blogsService.getBlog(this.blogId).subscribe((blog) => {
        if (!blog) return;
        this.currentBlog = blog;
        this.updateFormValues(blog);
        this.updateImageSources(blog);
      });
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
      this.blogsService.postNewBlog(newBlog).subscribe((resp) => {
        if (resp) {
          this.uploadFile(resp._id!);
          this.dashboardService.notificationPopup('success','Blog agregado',2000)
          this.downloadData(newBlog);
          this.resetForm();
        }else{
          this.dashboardService.notificationPopup('error','algo ocurrio al guardar el Blog',2000)
        }
        this.uploadingBlog = false;
      });
    }


    private updateBlog() {

        const { imgName, ...rest} = this.newBlog;

        const actualizedBlog = {
          ...rest,
          section: Section.BLOGS,
        };

      this.blogsService.editBlog(this.blogId, actualizedBlog as EditBlog).subscribe((resp) => {
        if (resp) {
          if(this.selectedFile !== null){
            this.uploadFile(this.currentBlog._id!);
            this.myForm.get('imgName')?.reset();
          }
          this.dashboardService.notificationPopup('success', 'Blog actualizado correctamente', 2000);
          this.getBlog();
          this.downloadData(actualizedBlog);
          this.resetForm()
        } else {
          this.dashboardService.notificationPopup("error", 'Algo salió mal al actualizar el Blog :(', 3000);
        }
        this.uploadingBlog = false;
      });
    }

    uploadFormData(formData: FormData, _id: string){
      if(formData){
        this.blogsService.postBlogImage(_id!, formData).subscribe(imgResp=>{

          if(!imgResp){
            this.uploadingBlog = false
            this.dashboardService.notificationPopup("error", 'El Blog fue guardado, pero algo salio mal al guardar la/s imagen/es revisa q su formato sea valido :(',3000)
          }
          this.dashboardService.notificationPopup('success','Blog agregado',2000)
          this.resetForm()
          this.getBlog();
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
        this.dashboardService.notificationPopup('success','Blog agregado',2000)
      return false;
    }
    else{
      this.dashboardService.notificationPopup("error", 'Algo salio mal al Guardar el Blog :(',3000);
      return false;
      }
  }

  // Delete image section
  showDeleteBtn(imgName: string | ArrayBuffer, event:Blog, id:string){
    if(!event) return false;
    return this.dashboardService.showDeleteBtn(imgName, event.imgName, id)
  }

  private confirmDelete() {
    return this.dashboardService.confirmDelete();
  }

  public getImagePaths(imgN: string, id: string) {
    return this.dashboardService.getImagePaths(imgN, id)
  }

  private cleanBlogImgName() {
    this.blogsService.editBlog(this.currentBlog._id!, { imgName:'' }).subscribe((editResp) => {
      if (editResp) {
        this.dashboardService.notificationPopup('success', 'La imagen se ha eliminado correctamente', 2000);
        this.resetForm();
        this.getBlog();
      }
    });
  }

  deleteImg(imgN: string) {
    this.confirmDelete().then((result) => {
      if (!result.isConfirmed) return;

      const { path, optimizePath, regularSize } = this.getImagePaths(imgN, this.currentBlog._id!);
      this.dashboardService.deleteItemImg(path, Section.BLOGS)?.subscribe((resp) => {
        this.cleanBlogImgName();
        if (resp) {
          this.dashboardService.deleteItemImg(optimizePath, Section.BLOGS)?.subscribe();
          this.dashboardService.deleteItemImg(regularSize, Section.BLOGS)?.subscribe();
        }else{
          this.dashboardService.notificationPopup('error', 'Algo ocurrio al eliminar la imagen', 2000);
        }
      });
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
          this.uploadingBlog = true;
          action === 'create' ? this.createBlog() : this.updateBlog();
        }
      });
    }
}

