import { Boardgame } from './../../interfaces/boards interfaces/boardgames.interface';
import { Component, inject, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
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
import { Dificulty } from '../../interfaces/boards interfaces/dificulty.enum';
import { Replayability } from '../../interfaces/boards interfaces/replayability.enum';
import { Router } from '@angular/router';
import { UnsaveComponent } from "../unsave/unsave.component";
import { catchError, finalize, forkJoin, map, Observable, of, Subscription, switchMap, throwError } from 'rxjs';


@Component({
  selector: 'boardgames-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, LoadingAnimationComponent, ReactiveFormsModule, CKEditorModule, UnsaveComponent],
  templateUrl: './boardgames-form.component.html',
  styleUrls: ['./boardgames-form.component.scss']
})
export class BoardgamesFormComponent implements OnDestroy {

  @Input() boardgameId!: string;
  private fb = inject(FormBuilder);
  private dashboardService = inject(DashboardService);
  private boardgamesService = inject(BoardgamesService);
  private fvService= inject(FormService);
  private router = inject(Router);
  private selectedFiles: FileList | null = null;
  private cardCoverFile: File | null = null;
  private fields:string[] = ['minPlayers', 'maxPlayers', 'duration', 'minAge']
  private boardsSubscriptions: Subscription = new Subscription();
  readonly categoryExplanation:string[] = boardGameCategories;
  readonly urlPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv|stories)\/[A-Za-z0-9_-]+\/?$|^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?$/;
  public currentBoardgame!: Boardgame;
  public isExplanationOpen: boolean = false;
  public loadingAnimation: boolean = false;
  public initialFormValues!: BoardgameUpload;
  public editorConfig!:EditorConfig;
  public Editor = ClassicEditor;
  public keywords: string[] = [];
  public originalsKeyWords: string [] = [];
  public charCount:number = 0;
  public averageCharacters:number = 0;
  public imgSrc:(string | ArrayBuffer)[] = [];
  public imgUrl: string[] = [];
  public cardCoverImgUrl: string = '';
  public cardCoverImgSrc:(string | ArrayBuffer)[] = [];
  public BoardgamesInputs: BoardInput[] = [
    { name: 'title',            placeHolder: 'Titulo', label:'', type: 'text', maxLenght: 50,  selectOptions:[]},
    { name: 'categoryChips',    placeHolder: 'Ingrese un Tag del juego EJ: Zombies,cooperative game, etc', label:'', type: 'text', maxLenght: 60,  selectOptions:[]},
    { name: 'minPlayers',       placeHolder: 'Min players', label:'Minima cantidad de players', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'maxPlayers',       placeHolder: 'Max players', label:'Maxima cantidad de players', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'minAge',           placeHolder: 'Edad Min', label:'Edad Minima', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'duration',         placeHolder: 'Minutos', label:'Duración (Minutos)', type: 'number', maxLenght: null,  selectOptions:[]},
    { name: 'categoryGame',         placeHolder: 'Selecciona una categoria:', label:'', type: 'select', maxLenght: null,  selectOptions: this.boardgamesService.boardsCategories},
    { name: 'dificulty',        placeHolder: 'Selecciona la dificultad:', label:'', type: 'select', maxLenght: null,  selectOptions: this.boardgamesService.dificulty},
    { name: 'replayability',    placeHolder: 'Selecciona la rejugabilidad:', label:'', type: 'select', maxLenght: null,  selectOptions: this.boardgamesService.replayability},
    { name: 'howToPlayUrl',     placeHolder: 'Ingrese el url de algun video que explique como Jugar', label:'', type: 'text', maxLenght: 9999,  selectOptions:[]},
    { name: 'reelInstagram',    placeHolder: 'Ingrese el url de algun Reel de instagram que hayamos hecho sobre el juego', label:'', type: 'text', maxLenght: 9999,  selectOptions:[]},
    { name: 'reelTikTok',       placeHolder: 'Ingrese el url de algun Reel de tik-tok que hayamos hecho sobre el juego', label:'', type: 'text', maxLenght: 9999,  selectOptions:[]},
    { name: 'cardCoverImgName', placeHolder: '', label: 'Seleccione la imagen de portada', type: 'file', maxLenght:null, selectOptions:[]},
    { name: 'imgName',              placeHolder: '', label: 'Seleccione las imágenes', type: 'file', maxLenght:null, selectOptions:[]},
    { name: 'gameReview',       placeHolder: '', label:'', type: 'textArea', maxLenght: null,  selectOptions:[]},
  ];

  public myForm = this.fb.group({
    title:['',[Validators.required]],
    categoryGame:['',[Validators.required]],
    categoryChips:[[''],],
    minPlayers:[0, [Validators.min(0)]],
    maxPlayers:[0, [Validators.min(0)]],
    minAge:[0, [Validators.min(0)]],
    duration:  [0, [Validators.min(0)]],
    gameReview:['',[]],
    dificulty:['',[Validators.required]],
    replayability:['',[Validators.required]],
    howToPlayUrl:['',[Validators.pattern(this.fvService.urlRegEx)]],
    imgName:[[''],[]],
    publish:[false],
    cardCoverImgName:['',[]],
    reelInstagram:['',[Validators.pattern(this.fvService.instaUrlRegEx)]],
    reelTikTok:['',[Validators.pattern(this.fvService.tikTokUrlRegEx)]],
  })
  ngOnInit(): void {
    this.editorConfig = toolBarConfig;
    this.editorConfig.placeholder = 'Escribe la reseña de este juegazo!';
    this.setValueToMyForm(this.fields);
    this.getBoard();
    this.initialFormValues = this.myForm.value as BoardgameUpload;
    this.hasFormChanged();
    this.getTextAverageLength();
  }

  ngOnDestroy(): void {
    this.cleanImg();
    this.boardsSubscriptions.unsubscribe();
  }

  getTextAverageLength(){
    const sub = this.dashboardService.getTextAverage(Section.BOARDGAMES).subscribe(resp=>{
      (resp)? this.averageCharacters = resp.charactersAverage : this.averageCharacters = 0;
    })

    this.boardsSubscriptions.add(sub);
  }

  async onFileSelected(event: Event, formControlName: string): Promise<FileList | void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      console.log('No se seleccionaron archivos.');
      return;
    }

    // cardCover
    if (formControlName === 'cardCoverImgName') {
      const validSize = this.fvService.avoidImgExceedsMaxSize(input.files[0].size, 3145728);

      if (validSize) {
        this.dashboardService.notificationPopup("error", 'El tamaño del archivo no debe superar los 3 MB.', 2000);
        this.myForm.get(formControlName)?.reset();
        this.cardCoverImgSrc = [];
        this.getBoard();
        return;
      }

      if (this.cardCoverImgSrc?.length === 0) {
        const image = await this.dashboardService.onFileSelected(event);
        this.cardCoverImgSrc = image;
        this.convertFilesToDataTransfer(input);
        const dataTransfer = this.convertFilesToDataTransfer(input);
        this.cardCoverFile = dataTransfer.item(0);
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

      if (validSize) {
        this.dashboardService.notificationPopup("error", 'El tamaño del archivo no debe superar los 3 MB.', 2000);
        this.myForm.get('imgName')?.reset();
        this.getBoard();
        return;
      }
      const images = await this.dashboardService.onFileSelected(event);

      if (this.imgSrc.length < 4 && (images.length + this.imgSrc.length <= 4)) {
      this.convertFilesToDataTransfer(input);
      const dataTransfer = this.convertFilesToDataTransfer(input);
        images.map(img =>{this.imgSrc.push(img)})
        return this.selectedFiles = dataTransfer;
      } else {
        this.dashboardService.notificationPopup("error", 'Máximo 4 imágenes', 3000);
        this.myForm.get('imgName')?.reset();
        return;
      }
    }
  }

  convertFilesToDataTransfer(input: HTMLInputElement): FileList {
    if (!input.files) return new DataTransfer().files;

    const fileArray = Array.from(input.files);
    const files = fileArray.map(file => new File([file], file.name, { type: file.type }));
    const dataTransfer = new DataTransfer();

    files.forEach(file => dataTransfer.items.add(file));

    return dataTransfer.files;
  }

  getBoard() {
    if (!this.boardgameId) return;

    const sub = this.boardgamesService.getBoard(this.boardgameId).subscribe((boardGame) => {
      if (!boardGame) return;
      this.currentBoardgame = {...boardGame};
      this.updateFormValues(boardGame);
      this.keywords = boardGame.categoryChips || [];
      this.originalsKeyWords = [...boardGame.categoryChips];
      (this.dashboardService.screenWidth > 800)?
        this.getImgUrlBoard(boardGame.imgName, boardGame.cardCoverImgName):
        this.getImgUrlBoard(boardGame.imgNameMobile, boardGame.cardCoverImgNameMobile);
    });

    this.boardsSubscriptions.add(sub);
  }

  getImgUrlBoard(images: string[], cardCoverImg: string) {
    this.cardCoverImgUrl = '';
    this.imgUrl = [];

    if (images){
      const imgsUrl = this.dashboardService.getLocalStorageMultipleImgUrl(this.currentBoardgame._id, Section.BOARDGAMES);
      if(imgsUrl?.length! > 0 && images.length === imgsUrl!.length){
        this.imgUrl = imgsUrl!;
        this.imgSrc = imgsUrl!;
      }else{
        let requestsCompleted = 0;
        this.dashboardService.deleteItemFromLocalStorage(this.currentBoardgame._id, Section.BOARDGAMES);
        images.forEach(img => {
          const sub = this.dashboardService.getImgUrl(img, Section.BOARDGAMES).subscribe(resp => {
            if (resp) {
              this.imgUrl.push(resp.signedUrl);
              (this.dashboardService.screenWidth > 800)?
              this.dashboardService.saveImgUrlLocalStorage({_id: this.currentBoardgame._id, imgUrl: resp.signedUrl, urlDate: new Date()}, Section.BOARDGAMES):
              this.dashboardService.saveImgUrlLocalStorage({_id: this.currentBoardgame._id, imgUrlMovile: resp.signedUrl, urlDate: new Date()}, Section.BOARDGAMES);
            }
            requestsCompleted++;
            if (requestsCompleted === images.length) {
              this.imgSrc = [...this.imgUrl];
            }
          });
          this.boardsSubscriptions.add(sub);
        });
      }
    }

    if (cardCoverImg) {
      const cardcoverImgUrl = this.dashboardService.getLocalStorageImgUrl(this.currentBoardgame._id, Section.BOARDGAMES);
      if(cardcoverImgUrl && cardCoverImg ){
        this.cardCoverImgUrl = cardcoverImgUrl;
          this.cardCoverImgSrc.push(this.cardCoverImgUrl);
      }else{
        const sub = this.dashboardService.getImgUrl(cardCoverImg, Section.BOARDGAMES).subscribe(resp => {
          if (resp) {
            this.cardCoverImgUrl = resp.signedUrl;
            this.cardCoverImgSrc = [this.cardCoverImgUrl];
            (this.dashboardService.screenWidth > 800)?
            this.dashboardService.saveImgUrlLocalStorage({_id: this.currentBoardgame._id, cardCoverImgUrl: resp.signedUrl, urlDate: new Date()}, Section.BOARDGAMES):
            this.dashboardService.saveImgUrlLocalStorage({_id: this.currentBoardgame._id, cardCoverImgUrlMovile: resp.signedUrl, urlDate: new Date()}, Section.BOARDGAMES);
          }
        });
        this.boardsSubscriptions.add(sub);
      }
    }
  }

  private updateFormValues(boardGame: Boardgame) {
    this.myForm.patchValue({
      title: boardGame.title,
      categoryGame: boardGame.categoryGame,
      categoryChips: [],
      minPlayers: boardGame.minPlayers,
      maxPlayers: boardGame.maxPlayers,
      minAge: boardGame.minAge,
      duration: boardGame.duration,
      gameReview: boardGame.gameReview,
      dificulty: boardGame.dificulty,
      replayability: boardGame.replayability,
      howToPlayUrl: boardGame.howToPlayUrl,
      reelInstagram: boardGame.reel[0]?.reelUrl,
      reelTikTok: boardGame.reel[1]?.reelUrl,
      publish: boardGame.publish
    });
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

    resetSelectedImages(inputName:string){
      if(inputName === 'cardCoverImgName'){
        this.myForm.get('cardCoverImgName')?.reset();
        this.cardCoverImgSrc = [];
        this.cardCoverFile = null;
      }else{
        this.myForm.get('imgName')?.reset();
        this.imgSrc = [...this.imgUrl];
        this.selectedFiles = null;
      }
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
      categoryControl.setValue([]);
      this.checkTagsChanged(this.originalsKeyWords , this.keywords);
    }

    deleteTagAndCheckDifferences(deletedTag: string){
      this.deleteTag(deletedTag);
      this.checkTagsChanged(this.originalsKeyWords, this.keywords);
    }

    deleteTag(deletedTag: string){
      this.keywords = this.keywords.filter(tag => tag !== deletedTag);
    }

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    hasFormChanged(){
      const sub = this.myForm.valueChanges.subscribe((formValue) => {
        if(this.trackInputChanges()) { return};

        if(this.boardgameId){
          const updatedBoardgame = {
            ...this.currentBoardgame,
            reelInstagram: this.currentBoardgame.reel[0].reelUrl,
            reelTikTok:this.currentBoardgame.reel[1].reelUrl
          };
          if(this.myForm.get('imgName')?.pristine){
            formValue.imgName = this.currentBoardgame.imgName;
          };

          if(this.myForm.get('cardCoverImgName')?.pristine){
            formValue.cardCoverImgName = this.currentBoardgame.cardCoverImgName;
          }
          const hasObjectsDifferences = this.areObjectsDifferent(updatedBoardgame,{...formValue});
          (!hasObjectsDifferences)? this.myForm.markAsPristine() : this.myForm.markAsDirty();
        }else{
          const hasObjectsDifferences = this.areObjectsDifferent(this.initialFormValues,{...formValue});
          (!hasObjectsDifferences)? this.myForm.markAsPristine() : this.myForm.markAsDirty();
        }
      });
      this.boardsSubscriptions.add(sub);
    }

    trackInputChanges(): boolean {
      return Object.keys(this.myForm.controls).some((key) => {
        if (this.myForm.get(key)?.dirty) {
          return key === 'categoryChips';
        }
        return false;
      });
    }

    checkTagsChanged(oldTags: string[], newTags: string[]){
      if(oldTags.length !== newTags.length){
        this.myForm.markAsDirty();
        return;
      }
      const tags = newTags.filter((newTags,i)=>{
        return newTags !== oldTags[i];
      });
      (tags.length !== 0)? this.myForm.markAsDirty() : this.myForm.markAsPristine();
    }

     areObjectsDifferent(itemValue:any, formValue:any) {
      return this.dashboardService.areObjectsDifferent(itemValue,formValue);
    }

    get newBoardGame(): BoardgameUpload {
      const formValue = this.myForm.value;

      const newBoardGame: BoardgameUpload = {
        section:             Section.BOARDGAMES,
        title:               formValue.title!,
        categoryGame:        formValue.categoryGame!,
        categoryChips:       this.keywords,
        minPlayers:          formValue.minPlayers ?? 1,
        maxPlayers:          formValue.maxPlayers ?? 1,
        minAge:              formValue.minAge ?? 1,
        duration:            formValue.duration ?? 0,
        gameReview:          formValue.gameReview ?? '',
        dificulty:           formValue.dificulty ?? Dificulty.NONE,
        replayability:       formValue.replayability ?? Replayability.NONE,
        howToPlayUrl:        formValue.howToPlayUrl ?? '',
        imgName:             [],
        cardCoverImgName:    '',
        reel:                [{plataform: 'Instagram', reelUrl: formValue.reelInstagram ?? ''},{plataform: 'TikTok', reelUrl: formValue.reelTikTok ?? ''}],
        publish: formValue.publish ?? false,
      };

      return newBoardGame;
    }

    public downloadData(newBoardGame: BoardgameUpload) {
      const updateBoardGame = { ...this.currentBoardgame };
      const { publish, ...formData } = this.myForm.value;

      const transformedBoardGame = {
        ...updateBoardGame,
        reelInstagram: updateBoardGame.reel?.[0]?.reelUrl ?? "",
        reelTikTok: updateBoardGame.reel?.[1]?.reelUrl ?? "",
        categoryChips: this.keywords
      };

      if (this.dashboardService.areObjectsDifferent(transformedBoardGame, formData)) {
        this.dashboardService.downloadObjectData(newBoardGame);
      }
    }

// Create and Update form

  cleanImg(){
    this.imgSrc = [];
    this.imgUrl = [];
    this.cardCoverImgUrl = '';
    this.cardCoverImgSrc = [];
  }

  uploadSingleimage(id: string, section: string, selectedFile: File): Observable<boolean> {
    if (!id || !selectedFile) {
      this.dashboardService.notificationPopup("error", "Algo salió mal al guardar el Board :(", 3000);
      return of(false);
    }

    const formData = this.dashboardService.formDataToUploadSingleImg(selectedFile);
    return this.dashboardService.postImage(id, section, formData!).pipe(
      map(resp => {
        if (!resp) {
          this.dashboardService.notificationPopup("error", "El Board Game fue guardado, pero hubo un error con la imagen.", 3000);
        }
        return true;
      }),
      finalize(() => {this.loadingAnimation = false})
    );
  }

  uploadMultipleImages(id: string, section: string, selectedFile: FileList): Observable<boolean> {
    if (!id || !selectedFile) {
      this.dashboardService.notificationPopup("error", "Algo salió mal al guardar el Board :(", 3000);
      return of(false);
    }

    const formData = this.dashboardService.formDataToUploadImgs(selectedFile);
    return this.dashboardService.postImage(id, section, formData!).pipe(
      map(resp => {
        if (!resp) {
          this.dashboardService.notificationPopup("error", "El Board Game fue guardado, pero hubo un error con la imagen.", 3000);
        }
      finalize(() => {this.loadingAnimation = false})
        return true;
      })
    );
  }

  uploadimages(id: string, section: string, selectedFiles: FileList): Observable<boolean> {
    if (!id || !selectedFiles || selectedFiles.length === 0) {
      this.dashboardService.notificationPopup("error", "Algo salió mal al guardar el Board :(", 3000);
      return of(false);
    }

    const uploadRequests: Observable<boolean>[] = [];
    uploadRequests.push(this.uploadMultipleImages(id, section, selectedFiles));

    return forkJoin(uploadRequests).pipe(
      map(results => results.every(success => success))
    );
  }

  private uploadFiles(boardgameId: string): Observable<boolean> {
    if (this.cardCoverFile && this.selectedFiles) {
      return this.uploadImagesSequentially(boardgameId);
    }

    const uploadTasks: Observable<boolean>[] = [];

    if (this.cardCoverFile) {
      uploadTasks.push(this.uploadSingleimage(boardgameId, 'boardgames/upload-cardcover-image', this.cardCoverFile));
    }

    if (this.selectedFiles && this.selectedFiles.length > 0) {
      uploadTasks.push(this.uploadimages(boardgameId, 'boardgames/upload-images', this.selectedFiles));
    }

    return uploadTasks.length > 0
      ? forkJoin(uploadTasks).pipe(map(results => results.every(success => success)))
      : of(true);
  }

  private uploadImagesSequentially(boardgameId: string): Observable<boolean> {
    return this.uploadSingleimage(boardgameId, 'boardgames/upload-cardcover-image', this.cardCoverFile!).pipe(
      switchMap((success) => {
        if (!success) return of(false);
        return this.uploadimages(boardgameId, 'boardgames/upload-images', this.selectedFiles!);
      }),
      catchError(error => {
        console.error("Error uploading images:", error);
        return of(false);
      })
    );
  }


  private createBoardGame() {
    this.loadingAnimation = true;

    const newBoardGame = this.newBoardGame;

    const sub = this.boardgamesService.postNewBoardG(newBoardGame).pipe(
      switchMap(resp => {
        if (!resp) {
          this.dashboardService.notificationPopup("error", "Error al crear el Board Game", 3000);
          return throwError(() => new Error("Error al crear el board game"));
        }
        return this.uploadFiles(resp._id).pipe(
          map(imagesUploaded => ({ boardGameId: resp._id, imagesUploaded }))
        );
      }),
      switchMap(({ boardGameId, imagesUploaded }) => {
        if (!imagesUploaded) {
          this.dashboardService.notificationPopup("error", "Algunas imágenes no se subieron correctamente.", 3000);
        }
        return this.boardgamesService.getBoard(boardGameId);
      }),
      finalize(() => {
        this.loadingAnimation = false;
      })
    ).subscribe({
      next: boardGame => {
        if (!boardGame) return;
        this.dashboardService.downloadObjectData(newBoardGame);
        this.router.navigateByUrl(`/lmdr/create-edit/BOARDGAMES/${boardGame._id}`);
        this.dashboardService.notificationPopup("success", "Board Game creado correctamente", 2000);
      },
      error: err => {
        if (err.status === 409 && err.error?.type === 'RESOURCE_ALREADY_EXISTS') {
          this.dashboardService.notificationPopup("error", "El boardgame ya existe", 2000);
        } else {
          this.dashboardService.notificationPopup("error", "Error al crear el Board Game", 3000);
        }
      },
    });
    this.boardsSubscriptions.add(sub);
  }

private updateBoardGame() {
  const { imgName, cardCoverImgName, ...rest } = this.newBoardGame;

  const actualizedBoard = {
    ...rest,
    section: Section.BOARDGAMES,
  };

  const sub = this.boardgamesService.editBoard(this.boardgameId, actualizedBoard as BoardgameUpload).pipe(
    switchMap(resp => {
      this.loadingAnimation = true;
      if (!resp) {
        this.dashboardService.notificationPopup("error", "Algo salió mal al actualizar el Board :(", 3000);
        return throwError(() => new Error("Error al actualizar el board game"));
      }
      return this.uploadFiles(this.boardgameId);
    }),
    switchMap((imagesUploaded) => {
      if (!imagesUploaded) {
        this.dashboardService.notificationPopup("error", "Algunas imágenes no se subieron correctamente.", 3000);
      }
      return this.boardgamesService.getBoard(this.boardgameId);
    }),
    finalize(() => this.loadingAnimation = false)
  ).subscribe(boardGame => {
    if (!boardGame) return;
    this.currentBoardgame = { ...boardGame };
    (this.onlyImagesAreDirty() || this.myForm.pristine)? null : this.dashboardService.downloadObjectData(actualizedBoard);
    this.resetForm();
    this.getImgUrlBoard(boardGame.imgName, boardGame.cardCoverImgName);
    this.updateFormValues(boardGame);
    this.dashboardService.notificationPopup("success", "Board Game actualizado correctamente", 2000);
  });
  this.boardsSubscriptions.add(sub);
  }

 loadImg(event: Event){
  const loadClass = 'board-games__form__img-container__img--loaded'
  this.dashboardService.loadImg(event, loadClass)
}

private resetForm() {
  this.myForm.reset({
    categoryGame: CategoryGame.NONE,
    dificulty: Dificulty.NONE,
    replayability: Replayability.NONE,
    publish: false,
  });
  this.keywords = [];
  this.cleanImg();
  this.myForm.markAsPristine();
  this.selectedFiles = null;
  this.cardCoverFile = null;
  this.getTextAverageLength();
}

onlyImagesAreDirty(): boolean {
  const controls = this.myForm.controls;

  const dirtyKeys = Object.keys(controls).filter(key => {
    const control = controls[key as keyof typeof controls];
    return control.dirty;
  });

  return dirtyKeys.length > 0 &&
         dirtyKeys.every(key => key === 'imgName' || key === 'cardCoverImgName');
}

  //DELETE IMG SECTION

  showDeleteBtn(imgName:  string | ArrayBuffer,imgUrl: string[]): boolean {
    return (imgUrl.includes(imgName.toString()))?true : false;
  }

  private confirmDelete() {
    return this.dashboardService.confirmDelete();
  }

  deleteImg(imgName: string, imgUrl:string | ArrayBuffer, isCardCover: boolean) {
    this.confirmDelete().then((result) => {
      if (!result.isConfirmed) return;

      this.loadingAnimation = true;
      const boardgameId = this.currentBoardgame._id;

      if (isCardCover) {
        this.deleteCardCoverImages(boardgameId, imgName, this.currentBoardgame.cardCoverImgNameMobile);
      } else {
        this.deleteRegularImage(boardgameId, imgName, imgUrl);
      }
    });
  }

  private deleteCardCoverImages(boardgameId: string, imgName: string, mobileImgName: string ) {
    const sub = this.dashboardService.deleteItemImg(boardgameId, Section.BOARDGAMES, imgName, 'delete-cardcover-image')!.pipe(
      switchMap((resp) => resp ? this.dashboardService.deleteItemImg(boardgameId, Section.BOARDGAMES, mobileImgName, 'delete-cardcover-image') ?? of(null) : of(null)),
      finalize(() => this.loadingAnimation = false)
    ).subscribe(resp => {
      if (resp) {
        this.dashboardService.notificationPopup('success', 'La imagen se ha eliminado correctamente', 2000);
        this.cardCoverImgSrc = [];
        this.dashboardService.removeCoverImagesFromSection(Section.BOARDGAMES,this.currentBoardgame._id);
      } else {
        this.dashboardService.notificationPopup('error', 'No se pudo eliminar la imagen', 2000);
      }
    });
    this.boardsSubscriptions.add(sub);
  }

  private deleteRegularImage(boardgameId: string, imgName: string, imgUrl: string | ArrayBuffer) {
    const sub = this.dashboardService.deleteItemImg(boardgameId, Section.BOARDGAMES, imgName, 'delete-image')!.pipe(
      finalize(() => this.loadingAnimation = false)
    ).subscribe(resp => {
      if (resp) {
        this.cleanDeletedImages(imgUrl);
        this.dashboardService.notificationPopup('success', 'La imagen se ha eliminado correctamente', 2000);
      } else {
        this.dashboardService.notificationPopup('error', 'No se pudo eliminar la imagen', 2000);
      }
    });
    this.boardsSubscriptions.add(sub);
  }

  cleanDeletedImages(imgName: string | ArrayBuffer){
    const filteredImages = this.imgUrl.filter((img) => img !== imgName.toString());
    this.imgUrl = filteredImages;
    this.imgSrc = filteredImages;
  }

  //Submit form

  private confirmAction(action: string) {
    return this.dashboardService.confirmAction(action, 'Board game')
  }

  onSubmit() {
    this.myForm.markAllAsTouched();
    if (this.myForm.invalid) return;

    const action = this.boardgameId ? 'update' : 'create';
    this.confirmAction(action).then((result) => {
      if (result.isConfirmed) {
        this.loadingAnimation = true;
        action === 'create' ? this.createBoardGame() : this.updateBoardGame();
      }
    });
  }
}
