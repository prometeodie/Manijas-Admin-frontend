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
  public options: string[] = ['LMDR'];
  private fvService= inject(FormService);
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
    { name: 'publish',     placeHolder: ':', label: 'Publicar:', type: 'checkbox', maxLenght:null,  selectOptions:[]},
  ];

  public myForm = this.fb.group({
    title:       ['',[Validators.required]],
    subTitle:    [,[]],
    blogContent: [,[]],
    category:    [,[Validators.required]],
    writedBy:    [,[Validators.required]],
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

    onSubmit(){
      alert('elemnto cargado')
    }
}
