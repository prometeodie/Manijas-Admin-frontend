import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { FormService } from 'src/app/services/form-validator.service';
import { ClassicEditor, EditorConfig } from 'ckeditor5';
import { AboutInput } from '../../interfaces';
import { toolBarConfig } from 'src/app/utils/toolbar-config';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'blogs-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, LoadingAnimationComponent, ReactiveFormsModule, CKEditorModule],
  templateUrl: './blogs-form.component.html',
  styleUrls: ['./blogs-form.component.scss']
})
export class BlogsFormComponent {
  private fb = inject(FormBuilder);
  private dashboardService= inject(DashboardService);
  private authService= inject(AuthService);
  public options: string[] = ['LMDR'];
  private fvService= inject(FormService);
  public editorConfig!:EditorConfig;
  public Editor = ClassicEditor;
  public charCount:number = 0;
  public imgSrc:string | ArrayBuffer | null ='';
  public aboutInputs: AboutInput[] = [
      { name: 'title', placeHolder: 'Titulo', label:'', type: 'text', maxLenght: 24 },
      { name: 'subTitle', placeHolder: 'subtítulo', label:'', type: 'text', maxLenght: 24 },
      { name: 'blogContent', placeHolder: 'contenido del blog', label:'', type: 'textArea', maxLenght: null },
      { name: 'writedBy', placeHolder: 'este blog fue escrito por', label:'', type: 'select', maxLenght: 24 }, //TODO:select y seleccionar entre el nombrey el nickname de la persona
      { name: 'img', placeHolder: '', label: 'Seleccionar una imagen', type: 'file', maxLenght:null},
      { name: 'publish', placeHolder: ':', label: 'Publicar:', type: 'checkbox', maxLenght:null },
    ];

  public myForm = this.fb.group({
      title:                   ['',[Validators.required]],
      publish:                   [false ,[Validators.required]],
      img:                       [],
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
