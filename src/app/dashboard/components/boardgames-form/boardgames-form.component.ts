import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { BoardgamesService } from '../../services/boardgames.service';
import { DashboardService } from '../../services/dashboard.service';
import { ClassicEditor, EditorConfig } from 'ckeditor5';
import { BoardInput } from '../../interfaces/boards interfaces/BoardGamesInput.interface';
import { FormService } from 'src/app/services/form-validator.service';
import { toolBarConfig } from 'src/app/utils/toolbar-config';
import { boardGameCategories } from './utils/categories-explanation';

@Component({
  selector: 'boardgames-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, LoadingAnimationComponent, ReactiveFormsModule, CKEditorModule],
  templateUrl: './boardgames-form.component.html',
  styleUrls: ['./boardgames-form.component.scss']
})
export class BoardgamesFormComponent {
  private fb = inject(FormBuilder);
  private dashboardService = inject(DashboardService);
  private boardgamesService = inject(BoardgamesService);
  private fvService= inject(FormService);
  readonly categoryExplanation:string[] = boardGameCategories;
  public isExplanationOpen: boolean = false;
  public editorConfig!:EditorConfig;
  public Editor = ClassicEditor;
  public charCount:number = 0;
  public imgSrc:(string | ArrayBuffer)[] = [];
  public cardCoverImgSrc:(string | ArrayBuffer)[] = [];
  // public imgSrc:any;
  public aboutInputs: BoardInput[] = [
    { name: 'title',            placeHolder: 'Titulo', label:'', type: 'text', maxLenght: 50,  selectOptions:[]},
    { name: 'categoryChips',    placeHolder: 'Ingrese un Tag del juego EJ: Zombies,cooperative game, etc', label:'', type: 'text', maxLenght: 60,  selectOptions:[]},
    { name: 'minPlayers',       placeHolder: 'Minima cantidad de players', label:'', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'maxPlayers',       placeHolder: 'Maxima cantidad de players', label:'', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'duration',         placeHolder: 'Duración', label:'', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'subTitle',         placeHolder: 'subtítulo', label:'', type: 'text', maxLenght: 60,  selectOptions:[]},
    { name: 'category',         placeHolder: 'Selecciona una categoria:', label:'', type: 'select', maxLenght: null,  selectOptions: this.boardgamesService.boardsCategories},
    { name: 'dificulty',        placeHolder: 'Selecciona la dificultad:', label:'', type: 'select', maxLenght: null,  selectOptions: this.boardgamesService.dificulty},
    { name: 'replayability',    placeHolder: 'Selecciona la rejugabilidad:', label:'', type: 'select', maxLenght: null,  selectOptions: this.boardgamesService.replayability},
    { name: 'howToPlayUrl',     placeHolder: 'Ingrese el url de algun video que explique como Jugar', label:'', type: 'text', maxLenght: 60,  selectOptions:[]},
    { name: 'reelInstagram',    placeHolder: 'Ingrese el url de algun Reel de instagram que hayamos hecho sobre el juego', label:'', type: 'text', maxLenght: 60,  selectOptions:[]},
    { name: 'reelTikTok',       placeHolder: 'Ingrese el url de algun Reel de tik-tok que hayamos hecho sobre el juego', label:'', type: 'text', maxLenght: 60,  selectOptions:[]},
    { name: 'cardCoverImgName', placeHolder: '', label: 'Seleccione la imagen de portada', type: 'file', maxLenght:null, selectOptions:[]},
    { name: 'img',              placeHolder: '', label: 'Seleccione las imágenes', type: 'file', maxLenght:null, selectOptions:[]},
    { name: 'gameReview',       placeHolder: '', label:'', type: 'textArea', maxLenght: null,  selectOptions:[]},
    { name: 'publish',          placeHolder: ':', label: 'Publicar:', type: 'checkbox', maxLenght:null,  selectOptions:[]},
  ];

  public myForm = this.fb.group({
    title:[,[Validators.required]],
    categoryChips:[,[]],
    minPlayers:[,[]],
    maxPlayers:[,[]],
    duration:[,[]],
    subTitle:[,[]],
    category:[,[Validators.required]],
    dificulty:[,[]],
    replayability:[,[]],
    howToPlayUrl:[,[]],
    reelInstagram:[,[]],
    reelTikTok:[,[]],
    cardCoverImgName:[,[]],
    img:[,[]],
    gameReview:[,[]],
    publish:[false ,[Validators.required]],
  })
  // TODO:hacer un validador para que pueda ingresar solo numero entero positicvo mayor a 1 en miny max players
  ngOnInit(): void {
    this.editorConfig = toolBarConfig;
    this.editorConfig.placeholder = 'Escribe la reseña de este juegazo!';
    // TODO: para meter data en el editor se usa la propiedad 	this.editorConfig.initialData: 'data...'
  }

  ngOnDestroy(): void {
    this.cleanImg();
  }
  async onFileSelected(event: Event, formControlName:string) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      if(formControlName === 'cardCoverImgName'){
        this.changeFileName(input.files[0]);
      }
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];

        const validSize = this.fvService.avoidImgExceedsMaxSize(file.size, 3145728);
        if (validSize) {
          this.dashboardService.notificationPopup("error", 'El tamaño del archivo no debe superar los 3 MB.');
          const fileControl = this.myForm.get('img');
          if (fileControl) {
            fileControl.reset();
            this.cleanImg();
          }
          return;
        }
        try {
          (formControlName === 'cardCoverImgName' )?
          this.cardCoverImgSrc = await this.dashboardService.onFileSelected(event):
          this.imgSrc = await this.dashboardService.onFileSelected(event);
        } catch (error) {
          console.error('Error al cargar el archivo:', error);

        }
      }
    } else {
      console.log('No se seleccionaron archivos.');
    }
  }

    openCloseExplanation(){
      this.isExplanationOpen =  !this.isExplanationOpen;
    }

    openExplanation(){
      this.openCloseExplanation();
      this.scrollToTop();
    }

    cleanImg(){
      this.imgSrc = [];
      this.dashboardService.cleanImgSrc();
    }

    countingChar(event: any){
      this.charCount = this.dashboardService.countingChar(event)
    }

    changeFileName(file: File | null) {
      if (!file) {
        return;
      }
      const originalName = file.name;
      const extension = originalName.slice(originalName.lastIndexOf('.'));
      const justOriginalName = originalName.slice(0,originalName.lastIndexOf('.'));
      const newFileName = `${justOriginalName}-cardCover${extension}`;
      const newFile = new File([file], newFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });

      return newFile;
    }

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    onSubmit(){
      alert('elemnto cargado')
    }
}
