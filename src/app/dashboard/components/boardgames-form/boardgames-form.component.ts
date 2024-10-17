import { Boardgame } from './../../interfaces/boards interfaces/boardgames.interface';
import { Component, inject, Input, ViewEncapsulation } from '@angular/core';
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
import { BoardgameUpload, CategoryGame, Section } from '../../interfaces';
import   Swal from 'sweetalert2';
import { Dificulty } from '../../interfaces/boards interfaces/dificulty.enum';
import { Replayability } from '../../interfaces/boards interfaces/replayability.enum';

@Component({
  selector: 'boardgames-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, LoadingAnimationComponent, ReactiveFormsModule, CKEditorModule],
  templateUrl: './boardgames-form.component.html',
  styleUrls: ['./boardgames-form.component.scss']
})
export class BoardgamesFormComponent {

  @Input() boardgameId!: string;

  private fb = inject(FormBuilder);
  private dashboardService = inject(DashboardService);
  private boardgamesService = inject(BoardgamesService);
  private fvService= inject(FormService);
  readonly categoryExplanation:string[] = boardGameCategories;
  readonly urlPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv|stories)\/[A-Za-z0-9_-]+\/?$|^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?$/;
  public currentBoardgame!: Boardgame;
  public isExplanationOpen: boolean = false;
  public uploadingBoardG: boolean = false;
  public editorConfig!:EditorConfig;
  private selectedFiles: FileList | null = null;
  private cardCoverFile: FileList | null = null;
  public Editor = ClassicEditor;
  public keywords: string[] = [];
  public charCount:number = 0;
  public imgSrc:(string | ArrayBuffer)[] = [];
  public cardCoverImgSrc:(string | ArrayBuffer)[] = [];
  public aboutInputs: BoardInput[] = [
    { name: 'title',            placeHolder: 'Titulo', label:'', type: 'text', maxLenght: 50,  selectOptions:[]},
    { name: 'categoryChips',    placeHolder: 'Ingrese un Tag del juego EJ: Zombies,cooperative game, etc', label:'', type: 'text', maxLenght: 60,  selectOptions:[]},
    { name: 'minPlayers',       placeHolder: 'Minima cantidad de players', label:'', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'maxPlayers',       placeHolder: 'Maxima cantidad de players', label:'', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'duration',         placeHolder: 'Duración', label:'', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'category',         placeHolder: 'Selecciona una categoria:', label:'', type: 'select', maxLenght: null,  selectOptions: this.boardgamesService.boardsCategories},
    { name: 'dificulty',        placeHolder: 'Selecciona la dificultad:', label:'', type: 'select', maxLenght: null,  selectOptions: this.boardgamesService.dificulty},
    { name: 'replayability',    placeHolder: 'Selecciona la rejugabilidad:', label:'', type: 'select', maxLenght: null,  selectOptions: this.boardgamesService.replayability},
    { name: 'howToPlayUrl',     placeHolder: 'Ingrese el url de algun video que explique como Jugar', label:'', type: 'text', maxLenght: 9999,  selectOptions:[]},
    { name: 'reelInstagram',    placeHolder: 'Ingrese el url de algun Reel de instagram que hayamos hecho sobre el juego', label:'', type: 'text', maxLenght: 9999,  selectOptions:[]},
    { name: 'reelTikTok',       placeHolder: 'Ingrese el url de algun Reel de tik-tok que hayamos hecho sobre el juego', label:'', type: 'text', maxLenght: 9999,  selectOptions:[]},
    { name: 'cardCoverImgName', placeHolder: '', label: 'Seleccione la imagen de portada', type: 'file', maxLenght:null, selectOptions:[]},
    { name: 'img',              placeHolder: '', label: 'Seleccione las imágenes', type: 'file', maxLenght:null, selectOptions:[]},
    { name: 'gameReview',       placeHolder: '', label:'', type: 'textArea', maxLenght: null,  selectOptions:[]},
  ];

  public myForm = this.fb.group({
    title:['',[Validators.required]],
    categoryChips:[[''],],
    minPlayers:[0, [Validators.min(1)]],
    maxPlayers:[0,[Validators.min(1)]],
    duration:  [0,  [Validators.min(1)]],
    category:['',[Validators.required]],
    dificulty:['',[]],
    replayability:['',[]],
    howToPlayUrl:['',[Validators.pattern(this.fvService.urlRegEx)]],
    reelInstagram:['',[Validators.pattern(this.fvService.instaUrlRegEx)]],
    reelTikTok:['',[Validators.pattern(this.fvService.tikTokUrlRegEx)]],
    cardCoverImgName:['',[]],
    img:[[''],[]],
    gameReview:['',[]],
    publish:[false],
  })

  private fields:string[] = ['minPlayers', 'maxPlayers', 'duration']
  ngOnInit(): void {
    this.editorConfig = toolBarConfig;
    this.editorConfig.placeholder = 'Escribe la reseña de este juegazo!';
    this.setValueToMyForm(this.fields);
    if(this.boardgameId){
      const id = this.boardgameId;
      this.boardgamesService.getBoard(id).subscribe( (boardGame) =>{
        if(boardGame){
          this.currentBoardgame = boardGame;
          this.myForm.patchValue({
            title: boardGame.title,
            category: boardGame.categoryGame,
            categoryChips:[],
            minPlayers: boardGame.minPlayers,
            maxPlayers: boardGame.maxPlayers,
            duration: boardGame.duration,
            dificulty: boardGame.dificulty,
            replayability: boardGame.replayability,
            howToPlayUrl: boardGame.howToPlayUrl,
            reelInstagram: boardGame.reel[0].reelUrl,
            reelTikTok: boardGame.reel[1].reelUrl,
            gameReview: boardGame.gameReview,
            publish: boardGame.publish
          });
        }
        this.keywords = boardGame?.categoryChips!;
        this.cardCoverImgSrc = this.boardgamesService.imgPathCreator(boardGame!, this.dashboardService.screenWidth, true);
        this.imgSrc = this.boardgamesService.imgPathCreator(boardGame!, this.dashboardService.screenWidth, false);
      })
    }
  }

  ngOnDestroy(): void {
    this.cleanImg();
  }

  async onFileSelected(event: Event, formControlName:string) {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = input.files;
    if (input.files && input.files.length > 0) {
      if(formControlName === 'cardCoverImgName'){
          this.cardCoverFile = this.changeFileName(input.files);
      }
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];

        const validSize = this.fvService.avoidImgExceedsMaxSize(file.size, 3145728);
        if (validSize) {
          this.dashboardService.notificationPopup("error", 'El tamaño del archivo no debe superar los 3 MB.',2000);
          const fileControl = this.myForm.get(formControlName);
          if (fileControl) {
            fileControl.reset();
            (formControlName === 'img')? this.imgSrc = [] : this.cardCoverImgSrc = [];
          }
          return;
        }
        try {
          const imagesSaved = this.boardgamesService.imgPathCreator(this.currentBoardgame, this.dashboardService.screenWidth, false);
          const images = await this.dashboardService.onFileSelected(event);

          if(formControlName === 'cardCoverImgName' ){
            (this.cardCoverImgSrc.length === 0)?
              this.cardCoverImgSrc = await this.dashboardService.onFileSelected(event):
              this.dashboardService.notificationPopup("error", 'Solo puede exitir una imagen de portada',3000)
          }else{
            this.imgSrc = [];
            imagesSaved.map(img=>{
              if(!this.imgSrc.includes(img)){
                this.imgSrc.push(img)
              }
            });
            if(this.imgSrc.length < 4 && (images.length + this.imgSrc.length <= 4)){
              images.map(img =>{
                this.imgSrc.push(img);
              })
            }else{
              this.dashboardService.notificationPopup("error", 'Maximo 4 imagenes',3000)
              this.myForm.get('img')?.reset();
            }
          }
        } catch (error) {
          console.error('Error al cargar el archivo:', error);

        }
      }
    } else {
      console.log('No se seleccionaron archivos.');
    }
  }

    isValidField(field: string):boolean | null{
      return this.fvService.isValidField(this.myForm,field);
    }

    showError(field: string):string | null{
      return `${this.fvService.showError(this.myForm,field)}`
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
      this.cardCoverImgSrc = [];
      this.dashboardService.cleanImgSrc();
    }

    countingChar(event: any){
      this.charCount = this.dashboardService.countingChar(event)
    }

    setValueToMyForm(fields: string[]){
      fields.map(field =>{
        this.myForm.get(field)?.setValue(null)
      })
    }
    changeFileName(fileList: FileList): FileList {
      const fileArray = Array.from(fileList);

      const renamedFiles = fileArray.map(file => {
        const fileName = file.name;
        const newFileName = fileName.replace(/(\.[\w\d_-]+)$/i, `-cardCover$1`); // Añade '-cardCover' al nombre
        return new File([file], newFileName, { type: file.type });
      });

      const dataTransfer = new DataTransfer();
      renamedFiles.forEach(file => dataTransfer.items.add(file));

      return dataTransfer.files;
    }

    saveNewTag(){

      const categoryControl = this.myForm.get('categoryChips');

      if (!categoryControl || typeof categoryControl.value !== 'string') return;
      const tag: string= categoryControl.value;

      if (!tag) return;

      if(this.keywords.includes(tag.trim())){
        alert('Ese tag ya esta ingresado, no sabes leer o sos parte del ojo del Hugo?')
        categoryControl.reset();
        return
      }
      this.keywords.push(tag.toLowerCase().trim());
      categoryControl.reset();
    }

    deleteTag(deletedTag: String){
      this.keywords = this.keywords.filter(tag => tag !== deletedTag);
    }

    showDeleteBtn(imgName:  string | ArrayBuffer, currentBoardgame:Boardgame, i:number){

      if (typeof imgName === 'string') {
        if(imgName.includes(currentBoardgame.cardCoverImgName) &&
        imgName.includes('cardCover')) {
          return true;
        };

        if(imgName.includes(currentBoardgame.imgName[i]) &&
        !imgName.includes('cardCover')) {
          return true;
        };
      }

      return false
    }

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }


    get currentBoardGame(): BoardgameUpload {
      const formValue = this.myForm.value;

      const newBoardGame: BoardgameUpload = {
        section:             Section.BOARDGAMES,
        title:               formValue.title!,
        categoryGame:        formValue.category!,
        categoryChips:       this.keywords,
        minPlayers:          formValue.minPlayers ?? 1,
        maxPlayers:          formValue.maxPlayers ?? 1,
        duration:            formValue.duration ?? 0,
        gameReview:          formValue.gameReview ?? '',
        dificulty:           formValue.dificulty ?? Dificulty.NONE,
        replayability:       formValue.replayability ?? Replayability.NONE,
        howToPlayUrl:        formValue.howToPlayUrl ?? '',
        reel:                [{plataform: 'Instagram', reelUrl: formValue.reelInstagram ?? ''},{plataform: 'TikTok', reelUrl: formValue.reelTikTok ?? ''}],
        imgName: [],
        publish: formValue.publish ?? false,

      };

      return newBoardGame;
    }

    uploadFormData(formData: FormData, _id: string){
      if(formData){
        this.boardgamesService.postBoardGImage(_id!, formData).subscribe(imgResp=>{
          if(!imgResp){
            this.uploadingBoardG = false
            this.dashboardService.notificationPopup("error", 'El Board Game fue guardado, pero algo salio mal al guardar la/s imagen/es revisa q su formato sea valido :(',3000)
          }
        });
      }
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
          this.uploadingBoardG = true;
          const currentBoardGame = this.currentBoardGame;
          console.log(currentBoardGame)
      this.boardgamesService.postNewBoardG(currentBoardGame).subscribe(
        resp=>{
          if(resp){
              const _id = resp._id;
              const formDataCardCover = this.dashboardService.formDataToUploadImgs(Section.BOARDGAMES, this.cardCoverFile!);
              const formData = this.dashboardService.formDataToUploadImgs(Section.BOARDGAMES, this.selectedFiles!);
            this.uploadFormData(formDataCardCover!, _id);
            this.uploadFormData(formData!, _id);
            this.uploadingBoardG = false
            this.dashboardService.notificationPopup('success','Board Game agregado',2000)
            this.imgSrc = [];
            this.myForm.reset({
              category: CategoryGame.NONE,
              dificulty:Dificulty.NONE,
              replayability:Replayability.NONE,
              publish: false
            });
            this.keywords = [];
            this.cleanImg();
          }else{
            this.uploadingBoardG = false
            this.dashboardService.notificationPopup("error", 'Algo salio mal al Guardar el Board :(',3000)
          }
        }
      );
        }
      })
    }
}
