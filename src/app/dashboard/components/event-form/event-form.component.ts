import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventManija } from '../../interfaces/event interfaces/event.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormService } from 'src/app/services/form-validator.service';
import { EventInput } from './interface/input.interface';
import { EventsService } from '../../services/events.service';
import { DashboardService } from '../../services/dashboard.service';
import { EditEventManija, EventCardSample } from '../../interfaces';
import { Section } from '../../shared/enum/section.enum';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';
import { EventSampleCardComponent } from '../event-sample-card/event-sample-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UnsaveComponent } from '../unsave/unsave.component';
import { finalize, forkJoin, map, Observable, of, Subscription, switchMap, throwError } from 'rxjs';


@Component({
  selector: 'event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingAnimationComponent,EventSampleCardComponent, UnsaveComponent],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit, OnDestroy{

  @Input() eventId!: string;
  @Output() newElementAdded = new EventEmitter<void>();
  private fb = inject(FormBuilder);
  private fvService = inject(FormService);
  private eventsService = inject(EventsService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private selectedFile: FileList | null = null;
  private isInCreateEditRoute: boolean = false;
  private TIME_REGEX = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
  private eventsSubscriptions: Subscription = new Subscription();
  public currentEvent!: EventManija;
  public loadingAnimation:boolean = false;
  public initialFormValues!: EditEventManija;
  public  autoDeleteChecked: boolean = true;
  public  showPopUpAutoDelete: boolean = false;
  public imgSrc:(string | ArrayBuffer)[] = [];
  public imgUrl:string[] = [];
  public existEvent: boolean = false;
  public colors: string[] = ['#ff3296', '#ff4b4b', '#872e6e', '#00ff64', '#0064ff', '#0096ff', '#18dcff', '#00ffc8', '#00d59c', '#32ff96', '#c832ff', '#ff64c8', '#ffdc00']
  public selectedColor: string = this.colors[0];
  public saveOrPublish:string = 'Guardar';
  public eventInputs: EventInput[] = [
    { name: 'title', placeHolder: 'Titulo', label: '', type: 'text', showIfAutoDelete: null, maxLenght: 24 },
    { name: 'eventDate', placeHolder: 'Fecha', label: 'Selecciona una fecha', type: 'date', showIfAutoDelete: true, maxLenght: null },
    { name: 'alternativeTxtEventDate', placeHolder: 'Ingrese texto alternativo', label: 'Fecha alternativa (Ej: Todos los Domingos)', type: 'text', showIfAutoDelete: false, maxLenght: null },
    { name: 'startTime', placeHolder: '', label: 'Horario de inicio', type: 'time', showIfAutoDelete: null, maxLenght: null },
    { name: 'finishTime', placeHolder: '', label: 'Horario de finalización', type: 'time', showIfAutoDelete: null, maxLenght: null },
    { name: 'eventPlace', placeHolder: 'Ingrese un Lugar', label: 'Escriba el Lugar del evento', type: 'text', showIfAutoDelete: null, maxLenght: 50 },
    { name: 'url', placeHolder: 'Url relacionado al evento', label: 'Url relacionado al evento (Ej: publicacion de Instagram)', type: 'text', showIfAutoDelete: null, maxLenght: null },
    { name: 'imgName', placeHolder: '', label: 'Seleccionar una imagen', type: 'file', showIfAutoDelete: null, maxLenght: null }
  ];

  public myForm = this.fb.group({
      title:                     ['',[Validators.required, Validators.maxLength(24)]],
      eventDate:                 ['',{validators:[Validators.required,this.eventsService.isValidDate(), this.eventsService.futureDateValidator()]}],
      alternativeTxtEventDate:   ['',[]],
      startTime:                 ['',[Validators.required, Validators.pattern(this.TIME_REGEX)]],
      finishTime:                ['',[Validators.required, Validators.pattern(this.TIME_REGEX)]],
      eventPlace:                ['',[Validators.maxLength(50)]],
      eventColor:                ['#ff3296',[]],
      url:                       ['',[Validators.pattern(this.fvService.urlRegEx)]],
      publish:                   [false],
      mustBeAutomaticallyDeleted:[true ,[Validators.required]],
      imgName:                   [''],
    })

    ngOnInit(): void {
      const sub = this.route.paramMap.subscribe(params => {
       (params.get('section')) ? this.isInCreateEditRoute = true: this.isInCreateEditRoute = false;
     });
      this.getEvent();
      this.initialFormValues = this.myForm.value as EditEventManija;
      this.hasFormChanged();
      this.eventsSubscriptions.add(sub);
    }

    ngOnDestroy(): void {
      this.eventsService.resetAllProperties();
      this.dashboardService.cleanImgSrc();
      this.eventsSubscriptions.unsubscribe();
    }

    updateSelectedColor(event: Event) {
      const selectElement = event.target as HTMLSelectElement;
      this.selectedColor = selectElement.value;
    }

    onAutoDeleteChange(event: any) {
      const input = event.target as HTMLInputElement;
      this.autoDeleteChecked = event.target.checked;
      this.showPopUpAutoDelete = !event.target.checked;
      this.eventsService.updateEventData({ mustBeAutomaticallyDeleted: input.checked });
      this.updateValidators();
      if(event.target.checked){
        this.myForm.get('alternativeTxtEventDate')?.reset()
        this.eventsService.resetpropertie(event.target.checked)
      }else{
        this.myForm.get('date')?.reset();
        this.eventsService.resetpropertie(event.target.checked)
      }
    }

    updateValidators() {
      const date = this.myForm.get('eventDate');
      const alternativeTxtEventDate = this.myForm.get('alternativeTxtEventDate');
        if (this.myForm.get('mustBeAutomaticallyDeleted')?.value){
          date?.setValidators([Validators.required])
          alternativeTxtEventDate?.clearValidators();
        }else{
          date?.clearValidators();
          alternativeTxtEventDate?.setValidators([Validators.required])
        }
        date?.updateValueAndValidity();
        alternativeTxtEventDate?.updateValueAndValidity();
      }


    onPublicCheckChange(event:Event){
       (this.dashboardService.onPublicCheckChange(event))? this.saveOrPublish = 'Publicar': this.saveOrPublish = ' Guardar';
    }


    shouldShowInput(eventInput: EventInput): boolean {
      if (eventInput.showIfAutoDelete === null) {
        return true;
      }
      return this.autoDeleteChecked === eventInput.showIfAutoDelete;
    }

    closePopUp(){
      this.showPopUpAutoDelete = false
    }

    // select image
    async onFileSelected(event: Event) {

      if(this.currentEvent && this.currentEvent._id){
        const thereisImg = this.dashboardService.validateImageUploadLimit(this.currentEvent.imgName);
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
        this.dashboardService.loadImage(this.imgSrc[0]);
        const validSize = this.fvService.avoidImgExceedsMaxSize(file.size, 3145728);
        if(validSize){
          this.dashboardService.notificationPopup("error", 'El tamaño del archivo no debe superar los 3 MB.', 2000)
            const fileControl = this.myForm.get('imgName');
            if (fileControl) {
              fileControl.reset();
              this.cleanImg()
            }
            return;
          }
        }
      }

      // get and fullfill form data
      getEvent() {
        this.existEvent = false;
        if (!this.eventId) return;
        const sub = this.eventsService.getEvent(this.eventId).subscribe((event) => {
          if (!event) return;
          this.existEvent = true;
          this.currentEvent = event;
          this.updateFormValues(event);
          this.getImageUrlByScreenSize(event);
          this.fullfillSampleCard(this.currentEvent as EventCardSample);
        });
        this.eventsSubscriptions.add(sub);
      }


  getImageUrlByScreenSize(event:EventManija){
                if(event.imgName){
                  const imgUrl = this.dashboardService.getLocalStorageImgUrl(this.currentEvent._id!, Section.EVENTS);
                  if(imgUrl){
                    this.imgUrl = [imgUrl];
                    this.imgSrc = [...this.imgUrl];
                  }else{
                    (this.dashboardService.screenWidth > 800)?
                    this.getImgUrlEvent(event.imgName):
                    this.getImgUrlEvent(event.imgMobileName);
                  }
                  this.dashboardService.loadImage(this.imgSrc[0]);
                }
              }

              getImgUrlEvent(image: string) {
                this.imgUrl = [];
                if (image){
                  const sub = this.dashboardService.getImgUrl(image, Section.EVENTS).subscribe(resp => {
                    if (resp) {
              this.dashboardService.deleteItemFromLocalStorage(this.currentEvent._id!, Section.EVENTS);
              this.imgUrl.push(resp.signedUrl);
              this.imgSrc = [...this.imgUrl];
              this.dashboardService.loadImage(this.imgSrc[0]);
               (this.dashboardService.screenWidth > 800)?
                            this.dashboardService.saveImgUrlLocalStorage({_id: this.currentEvent._id!, cardCoverImgUrl: resp.signedUrl, urlDate: new Date()}, Section.EVENTS):
                            this.dashboardService.saveImgUrlLocalStorage({_id: this.currentEvent._id!, cardCoverImgUrlMovile: resp.signedUrl, urlDate: new Date()}, Section.EVENTS);
            }
          });
          this.eventsSubscriptions.add(sub);
        }
      }

      fullfillSampleCard(event: EventCardSample){
        if(event){
          this.eventsService.updateEventData(event);
        }
        return;
      }

      get newEvent(): EditEventManija {
        const formValue = this.myForm.value;
        const newEvent: EditEventManija = {
          section: Section.EVENTS,
          title: formValue.title ?? '',
          eventDate: formValue.eventDate ? new Date(formValue.eventDate).toISOString() : null,
          alternativeTxtEventDate: formValue.alternativeTxtEventDate ?? null,
          startTime: formValue.startTime ?? '',
          finishTime: formValue.finishTime ?? '',
          eventPlace: formValue.eventPlace ?? '',
          eventColor: formValue.eventColor ?? '',
          url: formValue.url ?? '',
          publish: formValue.publish ?? false,
          imgName:'',
          mustBeAutomaticallyDeleted: formValue.mustBeAutomaticallyDeleted ?? false,
        };
        return newEvent;
      }


      hasFormChanged(){
        const sub = this.myForm.valueChanges.subscribe((formValue) => {
          if(this.eventId){
              const { eventDate, ...rest } = this.currentEvent;
              const updatedcurentEventValue = {
              ...rest,
              eventDate: eventDate?.toString().split('T')[0]
            };
            if(this.myForm.get('imgName')?.pristine){
              formValue.imgName = this.currentEvent.imgName;
            };
            const hasObjectsDifferences = this.areObjectsDifferent(updatedcurentEventValue, {...formValue});
            (!hasObjectsDifferences)? this.myForm.markAsPristine() : this.myForm.markAsDirty();
          }else{
            const hasObjectsDifferences = this.areObjectsDifferent(this.initialFormValues,{...formValue});
            (!hasObjectsDifferences)? this.myForm.markAsPristine() : this.myForm.markAsDirty();
          }
        });
        this.eventsSubscriptions.add(sub);
      }

      areObjectsDifferent(itemValue:any, formValue:any) {
        return this.dashboardService.areObjectsDifferent(itemValue,formValue);
      }


      private updateFormValues(event: EventManija) {
        const eventDate = event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '';
        this.myForm.patchValue({
          title:event.title,
          eventDate: eventDate,
          alternativeTxtEventDate:event.alternativeTxtEventDate,
          startTime:event.startTime,
          finishTime:event.finishTime,
          eventPlace:event.eventPlace,
          eventColor: event.eventColor,
          url:event.url,
          publish: event.publish,
          mustBeAutomaticallyDeleted: event.mustBeAutomaticallyDeleted
      });
      this.selectedColor = event.eventColor;
      this.autoDeleteChecked = event.mustBeAutomaticallyDeleted;
    }

    onFieldChange(field: string, event: Event) {
      const input = event.target as HTMLInputElement;
      this.eventsService.updateEventData({ [field as keyof EventCardSample]: input.value });
    }

    isValidField(field: string):boolean | null{
        return this.fvService.isValidField(this.myForm,field);
    }

    showError(field: string):string | null{
      return `${this.fvService.showError(this.myForm,field)}`
    }

    // Clean image and resert form

    cleanImg(){
      this.imgSrc = [];
      this.imgUrl = [];
      this.myForm.get('imgName')?.reset('');
      this.dashboardService.cleanImgSrc();
    }

    private resetForm() {
      this.myForm.reset();
      this.cleanImg();
      this.myForm.get('mustBeAutomaticallyDeleted')?.setValue(true)
      this.selectedColor = this.colors[0];
      this.eventsService.resetAllProperties();
      this.selectedFile = null;
    }

    // Create and Update form
    private createEvent() {
      const newEvent = this.newEvent;
      const sub =this.eventsService.postNewEvent(newEvent).pipe(
              switchMap(resp => {
                if (!resp) {
                  this.dashboardService.notificationPopup("error", "Error al crear el Evento", 3000);
                  return throwError(() => new Error("Error al crear el Evento"));
                }

                return this.uploadFile(resp._id!).pipe(
                  map(imagesUploaded => ({ eventId: resp._id, imagesUploaded }))
                );
              }),
              switchMap(({eventId, imagesUploaded }) => {
                if (!imagesUploaded) {
                  this.dashboardService.notificationPopup("error", "Algunas imágenes no se subieron correctamente.", 3000);
                }
                return this.eventsService.getEvent(eventId!);
              }),
              finalize(() => {
                this.loadingAnimation = false;
              })
            ).subscribe((event) => {
        if (event) {
          this.dashboardService.notificationPopup('success','Evento agregado',2000)
          this.newElementAdded.emit();
          (this.isInCreateEditRoute)? this.router.navigateByUrl(`/lmdr/create-edit/EVENTS/${event._id}`): this.router.navigateByUrl('/lmdr/events');
        }else{
          this.dashboardService.notificationPopup('error','algo ocurrio al guardar el evento',2000)
        }
        this.loadingAnimation = false;
      });
      this.eventsSubscriptions.add(sub);
    }

    private updateEvent() {
      const { imgName, ...rest} = this.newEvent;

      const actualizedEvent = {
        ...rest,
        section: Section.EVENTS,
      };

      const sub = this.eventsService.editEvent(this.eventId, actualizedEvent as EditEventManija).pipe(
        switchMap(resp => {
          this.loadingAnimation=true
          if (!resp) {
            this.dashboardService.notificationPopup("error", "Algo salió mal al actualizar el Evento :(", 3000);
            return throwError(() => new Error("Error al actualizar el Evento"));
          }
          return this.uploadFile(this.eventId!);
        }),
        switchMap((imagesUploaded) => {
          if (!imagesUploaded) {
            this.dashboardService.notificationPopup("error", "Algunas imágenes no se subieron correctamente.", 3000);
          }
          return this.eventsService.getEvent(this.eventId);
        }),
        finalize(() => this.loadingAnimation = false)
      )
      .subscribe((event) => {
        if (event) {
          this.dashboardService.notificationPopup('success', 'Evento actualizado correctamente', 2000);
          this.resetForm();
          this.getImageUrlByScreenSize(event)
          this.currentEvent = event;
          this.updateFormValues(event);
          this.fullfillSampleCard(event as EventCardSample);
        } else {
          this.dashboardService.notificationPopup("error", 'Algo salió mal al actualizar el Evento :(', 3000);
        }
        this.loadingAnimation = false;
      });
      this.eventsSubscriptions.add(sub);
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
        this.dashboardService.notificationPopup("error", "Algo salió mal al guardar el Evento :(", 3000);
        return of(false);
      }

      const formData = this.dashboardService.formDataToUploadSingleImg(selectedFile);
      return this.dashboardService.postImage(id, 'events/upload-image', formData!).pipe(
        switchMap(resp => {
          if (!resp) {
            this.dashboardService.notificationPopup("error", "El Evento Game fue guardado, pero hubo un error con la imagen.", 3000);
          }
          return of(true);
        }),
        finalize(() => {this.loadingAnimation = false})
      );
    }

  loadImg(event: Event){
    const loadClass = 'events__form__img-container__img--loaded'
    this.dashboardService.loadImg(event, loadClass)
  }

    //DELETE IMG SECTION

    showDeleteBtn(imgName:  string | ArrayBuffer,imgSrc: string[]): boolean {

      return (imgSrc.includes(imgName.toString()))?true : false;

    }

    private confirmDelete() {
      return this.dashboardService.confirmDelete();
    }

    public getImagePaths(imgN: string, id: string) {
      return this.dashboardService.getImagePaths(imgN, id)
    }


      deleteImg(imgName: string) {
        this.confirmDelete().then((result) => {
          if (!result.isConfirmed) return;
          this.loadingAnimation = true;
          this.deleteImage(this.eventId, imgName);
      })
    }

     private deleteImage(boardgameId: string, imgName: string) {
         const sub = this.dashboardService.deleteItemImg(boardgameId, Section.EVENTS, imgName, 'delete-image')!.pipe(
           finalize(() => this.loadingAnimation = false)
         ).subscribe(resp => {
           if (resp) {
             this.imgUrl = [];
             this.imgSrc = [];
             this.currentEvent.imgName = '';
             this.dashboardService.deleteItemFromLocalStorage(this.currentEvent._id!, Section.EVENTS);
             this.dashboardService.cleanImgSrc();
             this.dashboardService.notificationPopup('success', 'La imagen se ha eliminado correctamente', 2000);
           } else {
             this.dashboardService.notificationPopup('error', 'No se pudo eliminar la imagen', 2000);
           }
         });
         this.eventsSubscriptions.add(sub);
       }

    ///Submit form
    private confirmAction(action: string) {
      return this.dashboardService.confirmAction(action, 'Evento')
    }

    onSubmit() {
      this.myForm.markAllAsTouched();
      if (this.myForm.invalid) return;
      const action = this.currentEvent ? 'update' : 'create';
      this.confirmAction(action).then((result) => {
        if (result.isConfirmed) {
          this.loadingAnimation = true;
          action === 'create' ? this.createEvent() : this.updateEvent();
        }
      });
    }

}

