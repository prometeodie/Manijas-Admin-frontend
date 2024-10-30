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
    { name: 'minPlayers',       placeHolder: 'Min players', label:'Minima cantidad de players', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'maxPlayers',       placeHolder: 'Max players', label:'Maxima cantidad de players', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'minAge',           placeHolder: 'Edad Min', label:'Edad Minima', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'duration',         placeHolder: 'Minutos', label:'Duración (Minutos)', type: 'number', maxLenght: null,  selectOptions:[]},
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
    minPlayers:[0, [Validators.min(0)]],
    maxPlayers:[0, [Validators.min(0)]],
    minAge:[0, [Validators.min(0)]],
    duration:  [0, [Validators.min(0)]],
    category:['',[Validators.required]],
    dificulty:['',[Validators.required]],
    replayability:['',[Validators.required]],
    howToPlayUrl:['',[Validators.pattern(this.fvService.urlRegEx)]],
    reelInstagram:['',[Validators.pattern(this.fvService.instaUrlRegEx)]],
    reelTikTok:['',[Validators.pattern(this.fvService.tikTokUrlRegEx)]],
    cardCoverImgName:['',[]],
    img:[[''],[]],
    gameReview:['',[]],
    publish:[false],
  })

  private fields:string[] = ['minPlayers', 'maxPlayers', 'duration', 'minAge']
  ngOnInit(): void {
    this.editorConfig = toolBarConfig;
    this.editorConfig.placeholder = 'Escribe la reseña de este juegazo!';
    this.setValueToMyForm(this.fields);
    this.getBoard();
  }

  ngOnDestroy(): void {
    this.cleanImg();
  }
  async onFileSelected(event: Event, formControlName: string): Promise<FileList | void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      console.log('No se seleccionaron archivos.');
      return;
    }

    // cardCover
    if (formControlName === 'cardCoverImgName') {
      if (this.currentBoardgame.cardCoverImgName.length === 0) {
        this.cardCoverImgSrc = [];
      }

      // Cambia el nombre del archivo de portada
      this.cardCoverFile = this.changeFileName(input.files[0]);
      const validSize = this.fvService.avoidImgExceedsMaxSize(this.cardCoverFile[0].size, 3145728);

      if (validSize) {
        this.dashboardService.notificationPopup("error", 'El tamaño del archivo no debe superar los 3 MB.', 2000);
        this.myForm.get(formControlName)?.reset();
        this.cardCoverImgSrc = [];
        this.getBoard();
        return;
      }

      if (this.cardCoverImgSrc.length === 0) {
        this.cardCoverImgSrc = await this.dashboardService.onFileSelected(event);
      } else {
        this.dashboardService.notificationPopup("error", 'Solo puede existir una imagen de portada', 3000);
        return;
      }
      return;
    }

    // Regular images
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      const validSize = this.fvService.avoidImgExceedsMaxSize(file.size, 3145728);
      this.imgSrc = [];

      if (validSize) {
        this.dashboardService.notificationPopup("error", 'El tamaño del archivo no debe superar los 3 MB.', 2000);
        this.myForm.get('img')?.reset();
        this.imgSrc = [];
        this.getBoard();
        return;
      }

      const imagesSaved = this.boardgamesService.imgPathCreator(this.currentBoardgame, this.dashboardService.screenWidth, false);
      const images = await this.dashboardService.onFileSelected(event);

      imagesSaved.forEach(img => this.imgSrc.push(img));

      if (this.imgSrc.length < 4 && (images.length + this.imgSrc.length <= 4)) {
        const fileArray = Array.from(input.files);
        const files = fileArray.map(file => new File([file], file.name, { type: file.type }));
        images.map(img =>{this.imgSrc.push(img)})
        const dataTransfer = new DataTransfer();
        files.forEach(file => dataTransfer.items.add(file));
        return this.selectedFiles = dataTransfer.files;
      } else {
        this.dashboardService.notificationPopup("error", 'Máximo 4 imágenes', 3000);
        this.myForm.get('img')?.reset();
        return;
      }
    }
  }

  getBoard(){
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
            minAge: boardGame.minAge,
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
    }

    resetSelectedImages(){
      this.myForm.get('img')?.reset();
      this.getBoard();
    }

    countingChar(event: any){
      this.charCount = this.dashboardService.countingChar(event)
    }

    setValueToMyForm(fields: string[]){
      fields.map(field =>{
        this.myForm.get(field)?.setValue(null)
      })
    }

    changeFileName(file: File):FileList {
      const newFileName = file.name.replace(/(\.[\w\d_-]+)$/i, `-cardCover$1`);
      const dataTransfer = new DataTransfer();
      const newFile = new File([file], newFileName, { type: file.type });
      dataTransfer.items.add(newFile)

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

    deleteImg(imgN:string){
      Swal.fire({
        title: 'Quieres eliminar la imagen?',
        text: "",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, save it!'
      }).then((result) => {
        if(!result.isConfirmed) return;
          let path = '';
          let optimizePath = '';

          if(imgN.includes('cardCover'))
            {
              path = `${this.currentBoardgame._id}/cardCover/${imgN}`
              optimizePath = `${this.currentBoardgame._id}/cardCover/optimize/smallS-${imgN}`
            }else{
              path = `${this.currentBoardgame._id}/${imgN}`;
              optimizePath = `${this.currentBoardgame._id}/optimize/smallS-${imgN}`
        }

          this.dashboardService.deleteItemImg(path, Section.BOARDGAMES)?.subscribe(resp=>{
            if(resp){
              this.dashboardService.deleteItemImg(optimizePath, Section.BOARDGAMES)?.subscribe();
              (imgN.includes('cardCover'))? this.currentBoardgame.cardCoverImgName = '' : this.currentBoardgame.imgName = this.currentBoardgame.imgName.filter(img => img != imgN )
              const { cardCoverImgName,  imgName } = this.currentBoardgame;
              this.boardgamesService.editBoard(this.currentBoardgame._id, {cardCoverImgName, imgName} ).subscribe(editResp =>{
                if(editResp){
                  this.getBoard();
                  this.dashboardService.notificationPopup('success', 'La imagen se ha eliminado correctamente', 2000);
                }
              })
            }
          });
      });
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
        minAge:              formValue.minAge ?? 1,
        duration:            formValue.duration ?? 0,
        gameReview:          formValue.gameReview ?? '',
        dificulty:           formValue.dificulty ?? Dificulty.NONE,
        replayability:       formValue.replayability ?? Replayability.NONE,
        howToPlayUrl:        formValue.howToPlayUrl ?? '',
        reel:                [{plataform: 'Instagram', reelUrl: formValue.reelInstagram ?? ''},{plataform: 'TikTok', reelUrl: formValue.reelTikTok ?? ''}],
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
          this.getBoard();
        });
      }
    }

    uploadimages(id: string , section:Section, selectedFiles: FileList){

      if(id && selectedFiles){
        const formData = this.dashboardService.formDataToUploadImgs(section, selectedFiles!);
      this.uploadFormData(formData!, id);
      this.dashboardService.notificationPopup('success','Board Game agregado',2000)
      return false;
    }
    else{
      this.dashboardService.notificationPopup("error", 'Algo salio mal al Guardar el Board :(',3000);
      return false;
      }
  }

    onSubmit(){
      this.myForm.markAllAsTouched();
      if(this.myForm.invalid) return;
      if(!this.boardgameId){

        Swal.fire({
          title: 'Quieres guardar un nuevo Board game?',
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
        this.boardgamesService.postNewBoardG(currentBoardGame).subscribe(
          resp=>{
            this.uploadimages(resp!._id, Section.BOARDGAMES, this.cardCoverFile!);
            this.uploadimages(resp!._id, Section.BOARDGAMES, this.selectedFiles!);
            this.uploadingBoardG = false
            this.myForm.reset({
                category: CategoryGame.NONE,
                dificulty:Dificulty.NONE,
                replayability:Replayability.NONE,
                publish: false
              });
              this.keywords = [];
              this.cleanImg();
            }
        );
          }
        })
      }else{
        Swal.fire({
          title: 'Quieres actualizar el Board game?',
          text: "",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, save it!'
        }).then((result) => {
          if (result.isConfirmed) {
            this.uploadingBoardG = true;
            const actualizedBoard = {
              ...this.currentBoardGame,
              section: Section.BOARDGAMES,
            };
            console.log(actualizedBoard)
            this.boardgamesService.editBoard(this.boardgameId, actualizedBoard as BoardgameUpload).subscribe(resp =>{
              if(resp){

                if(this.cardCoverFile){
                  this.uploadimages(this.boardgameId, Section.BOARDGAMES, this.cardCoverFile!);
                };

                if(this.selectedFiles){
                    this.uploadimages(this.boardgameId, Section.BOARDGAMES, this.selectedFiles!);
                  };

                this.myForm.get('cardCoverImgName')?.reset();
                this.myForm.get('img')?.reset();
                this.getBoard();
                this.uploadingBoardG = false;
                this.dashboardService.notificationPopup('success','Board Game actualizado correctamente',2000)
                this.selectedFiles = null;
                this.cardCoverFile = null;
              }else{
                this.uploadingBoardG = false
                this.dashboardService.notificationPopup("error", 'Algo salio mal al Actualizar el Board :(',3000)
              }
            })
          }
      })
    }
  }
}
