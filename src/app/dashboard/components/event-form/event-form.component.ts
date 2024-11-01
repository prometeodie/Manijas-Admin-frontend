import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgPipePipe } from '../../pipes/img-pipe.pipe';
import { EventManija } from '../../interfaces/event inteefaces/event.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormService } from 'src/app/services/form-validator.service';
import { EventInput } from './interface/input.interface';
import { EventsService } from '../../services/events.service';
import { DashboardService } from '../../services/dashboard.service';
import { EditEventManija, EventCardSample } from '../../interfaces';
import   Swal from 'sweetalert2';
import { Section } from '../../shared/enum/section.enum';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';
import { EventSampleCardComponent } from '../event-sample-card/event-sample-card.component';
import { Router } from '@angular/router';


@Component({
  selector: 'event-form',
  standalone: true,
  imports: [CommonModule, ImgPipePipe, ReactiveFormsModule, LoadingAnimationComponent,EventSampleCardComponent],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit{
  @Input() eventId!: string;
  @Output() newElementAdded = new EventEmitter<void>();
  private fb = inject(FormBuilder);
  private fvService = inject(FormService);
  private eventsService = inject(EventsService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private selectedFile: File | null = null;
  private TIME_REGEX = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
  public currentEvent!: EventManija;
  public uploadingEvent:boolean = false;
  public  autoDeleteChecked: boolean = true;
  public  showPopUpAutoDelete: boolean = false;
  public imgSrc:(string | ArrayBuffer)[] = [];
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
    { name: 'img', placeHolder: '', label: 'Seleccionar una imagen', type: 'file', showIfAutoDelete: null, maxLenght: null }
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
      img:                       [],
    })

    ngOnInit(): void {
      this.getEvent();
    }

    updateSelectedColor(event: Event) {
      const selectElement = event.target as HTMLSelectElement;
      this.selectedColor = selectElement.value;
    }

    onAutoDeleteChange(event: any) {
      const input = event.target as HTMLInputElement;
      this.autoDeleteChecked = event.target.checked;
      this.showPopUpAutoDelete = !event.target.checked;
      this.eventsService.updateEventData({ mustBeAutomaticallyDeleted: !input.checked });
      this.updateValidators();
      if(event.target.checked){
        this.myForm.get('alternativeTxtEventDate')?.reset()
        this.eventsService.resetpropertie(event.target.checked)
      }else{
        this.myForm.get('date')?.reset();
        this.eventsService.resetpropertie(event.target.checked)
      }
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

    async onFileSelected(event: Event) {
      const input = event.target as HTMLInputElement;
      this.imgSrc = await this.dashboardService.onFileSelected(event);
      this.dashboardService.loadImage(this.imgSrc[0]);
      this.selectedFile = this.dashboardService.returnOneImg(event);
      if(input.files){
        const file = input.files[0];
        const validSize = this.fvService.avoidImgExceedsMaxSize(file.size, 3145728);
        if(validSize){
          this.dashboardService.notificationPopup("error", 'El tamaño del archivo no debe superar los 3 MB.', 2000)
            const fileControl = this.myForm.get('img');
            if (fileControl) {
              fileControl.reset();
              this.cleanImg()
            }
            return;
          }
        }
      }

      getEvent() {
        if (!this.eventId) return;

        this.eventsService.getEvent(this.eventId).subscribe((event) => {
          if (!event) return;

          this.currentEvent = event;
          this.updateFormValues(event);
          // this.updateImageSources(event);
        });
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

    // private updateImageSources(event: EventManija) {
    //   this.imgSrc = this.eventsService.imgPathCreator(boardGame, this.dashboardService.screenWidth, false);
    // }

    onFieldChange(field: string, event: Event) {
      const input = event.target as HTMLInputElement;
      this.eventsService.updateEventData({ [field as keyof EventCardSample]: input.value });
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


    isValidField(field: string):boolean | null{
        return this.fvService.isValidField(this.myForm,field);
    }

    showError(field: string):string | null{
      return `${this.fvService.showError(this.myForm,field)}`
    }

    get newEvent(): EventManija {
      const formValue = this.myForm.value;
      const newEvent: EventManija = {
        section: 'EVENTS',
        title: formValue.title ?? '',
        eventDate: formValue.eventDate ? new Date(formValue.eventDate).toISOString() : null,
        alternativeTxtEventDate: formValue.alternativeTxtEventDate ?? null,
        startTime: formValue.startTime ?? '',
        finishTime: formValue.finishTime ?? '',
        eventPlace: formValue.eventPlace ?? '',
        eventColor: formValue.eventColor ?? '',
        url: formValue.url ?? '',
        publish: formValue.publish ?? false,
        mustBeAutomaticallyDeleted: formValue.mustBeAutomaticallyDeleted ?? false,
        imgName: ''
      };
      return newEvent;
    }

    cleanImg(){
      this.imgSrc = [];
      this.dashboardService.cleanImgSrc();
    }

    private confirmAction(action: string) {
      return this.dashboardService.confirmAction(action, 'Evento')
    }

    private resetForm() {
      this.myForm.reset();
      this.cleanImg();
      // this.selectedFiles = null;
    }


    private createBoardGame() {
      const newEvent = this.newEvent;
      this.eventsService.postNewEvent(newEvent).subscribe((resp) => {
        if (resp) {
          // this.uploadFiles(resp._id);
          this.resetForm();
          this.router.navigateByUrl('lmdr/boardgames');
        }
        this.uploadingEvent = false;
      });
    }

    private updateBoardGame() {
      const actualizedEvent = { ...this.newEvent, section: Section.EVENTS };
      this.eventsService.editEvent(this.eventId, actualizedEvent as EditEventManija).subscribe((resp) => {
        if (resp) {
          // this.uploadFiles(this.boardgameId);
          this.getEvent();
          this.myForm.get('cardCoverImgName')?.reset();
          this.myForm.get('img')?.reset();
          this.dashboardService.notificationPopup('success', 'Board Game actualizado correctamente', 2000);
          this.router.navigateByUrl('lmdr/events')
        } else {
          this.dashboardService.notificationPopup("error", 'Algo salió mal al actualizar el Board :(', 3000);
        }
        this.uploadingEvent = false;
      });
    }


    onSubmit() {
      this.myForm.markAllAsTouched();
      if (this.myForm.invalid) return;

      const action = this.eventId ? 'update' : 'create';
      this.confirmAction(action).then((result) => {
        if (result.isConfirmed) {
          this.uploadingEvent = true;
          action === 'create' ? this.createBoardGame() : this.updateBoardGame();
        }
      });
    }

}

