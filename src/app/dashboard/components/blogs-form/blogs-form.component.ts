import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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
import { Blog, Section } from '../../interfaces';
import Swal from 'sweetalert2';
import { BlogsCategories } from '../../interfaces/blogs interfaces/blog-categories.enum';

@Component({
  selector: 'blogs-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, LoadingAnimationComponent, ReactiveFormsModule, CKEditorModule],
  templateUrl: './blogs-form.component.html',
  styleUrls: ['./blogs-form.component.scss']
})
export class BlogsFormComponent implements  OnInit,OnDestroy{
  private fb = inject(FormBuilder);
  private dashboardService= inject(DashboardService);
  private blogsService= inject(BlogsService);
  private authService= inject(AuthService);
  private fvService= inject(FormService);
  public uploadingBlog: boolean = false;
  private selectedFile: File | null = null;
  public options: string[] = ['LMDR'];
  public editorConfig!:EditorConfig;
  public Editor = ClassicEditor;
  public charCount:number = 0;
  public imgSrc:(string | ArrayBuffer)[] = [];
  public aboutInputs: BlogInput[] = [
    { name: 'title',       placeHolder: 'Titulo', label:'', type: 'text', maxLenght: 50,  selectOptions:[]},
    { name: 'subTitle',    placeHolder: 'subtítulo', label:'', type: 'text', maxLenght: 60,  selectOptions:[]},
    { name: 'blogContent', placeHolder: '', label:'', type: 'textArea', maxLenght: null,  selectOptions:[]},
    { name: 'category',    placeHolder: 'Selecciona una categoria:', label:'', type: 'select', maxLenght: null,  selectOptions: this.blogsService.blogsCategories},
    { name: 'writedBy',    placeHolder: 'Seleccione el autor de este Blog:', label:'', type: 'select', maxLenght: null,  selectOptions: this.options},
    { name: 'img',         placeHolder: '', label: 'Seleccionar una imagen', type: 'file', maxLenght:null, selectOptions:[]},
  ];

  public myForm = this.fb.group({
    title:       ['',[Validators.required]],
    subTitle:    [,[]],
    blogContent: ['',[]],
    category:    [BlogsCategories.NONE,[Validators.required]],
    writedBy:    ['',[Validators.required]],
    publish:     [false ,[]],
    img:         [],
  })

  ngOnInit(): void {
    this.editorConfig = toolBarConfig;
    this.editorConfig.placeholder = 'Ingresa el contenido del blog!';
    this.options.unshift(this.authService.currentUser()!.name);
    this.options.unshift(this.authService.currentUser()!.nickname);
    // TODO: para meter data en el editor se usa la propiedad 	this.editorConfig.initialData: 'data...'
  }

  ngOnDestroy(): void {
    this.cleanImg();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
      this.imgSrc = await this.dashboardService.onFileSelected(event);
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

    get currentBlog(): Blog {
      const formValue = this.myForm.value;

      const newBlog: Blog = {
        section: Section.BLOGS,
        title:       formValue.title!,
        subTitle:    formValue.subTitle!,
        writedBy:    formValue.writedBy!,
        blogContent: formValue.blogContent!,
        category:    formValue.category!,
        imgName: '',
        publish: formValue.publish ?? false,
      };
      console.log(newBlog)
      return newBlog;
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
          this.uploadingBlog = true;
          const currentBlog = this.currentBlog;
      this.blogsService.postNewBlog(currentBlog).subscribe(
        resp=>{
          if(resp){
            const _id = resp._id;
              const formData = this.dashboardService.formDataToUploadImg(Section.BLOGS, this.selectedFile!)
            if(formData){
                this.blogsService.postBlogImage(_id!, formData).subscribe(imgResp=>{
                  if(!imgResp){
                    this.uploadingBlog = false
                    this.dashboardService.notificationPopup("error",'El Blog fue guardado, pero algo salio mal al guardar la/s imagen/es revisa q su formato sea valido :(', 3000)
                  }
                });
              }
            this.uploadingBlog = false
            this.dashboardService.notificationPopup('success','Evento agregado',2000)
            this.imgSrc = [];
            this.myForm.reset({ writedBy: "", category:BlogsCategories.NONE });
            this.cleanImg();
          }else{
            this.uploadingBlog = false
            this.dashboardService.notificationPopup("error", 'Algo salio mal :(',2000)
          }
        }
      );
        }
      })
    }
}

