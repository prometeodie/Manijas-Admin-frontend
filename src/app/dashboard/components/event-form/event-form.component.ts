import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
  imports: [CommonModule, ReactiveFormsModule, LoadingAnimationComponent, EventSampleCardComponent],
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
  private selectedFile: FileList | null = null;
  private TIME_REGEX = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
  public currentEvent!: EventManija;
  public uploadingEvent:boolean = false;
  public  autoDeleteChecked: boolean = true;
  public  showPopUpAutoDelete: boolean = false;
  public imgSrc:(string | ArrayBuffer)[] = [];
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

    ngOnDestroy(): void {
      this.eventsService.resetAllProperties()
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
        const thereisImg = this.dashboardService.validateImageUploadLimit(this.currentEvent._id, this.currentEvent.imgName.length);
        if(thereisImg){
          this.myForm.get('img')?.reset();
          return;
        }
      }
      const input = event.target as HTMLInputElement;
      this.imgSrc = await this.dashboardService.onFileSelected(event);
      this.dashboardService.loadImage(this.imgSrc[0]);
      this.selectedFile = this.dashboardService.returnImgs(event);
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

      private updateImageSources(event: EventManija) {
        this.imgSrc = this.dashboardService.imgPathCreator(event.imgName,this.dashboardService.screenWidth, Section.EVENTS, this.eventId,  );
      }

      // get and fullfill form data
      getEvent() {
        this.existEvent = false;

        if (!this.eventId) return;

        this.eventsService.getEvent(this.eventId).subscribe((event) => {
          if (!event) return;
          this.existEvent = true;
          this.currentEvent = event;
          this.updateFormValues(event);
          this.updateImageSources(event);
          this.fullfillSampleCard(this.currentEvent as EventCardSample);
        });
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
        };
        return newEvent;
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
      this.myForm.get('img')?.reset();
      this.dashboardService.cleanImgSrc();
    }

    private resetForm() {
      this.myForm.reset();
      this.cleanImg();
      this.myForm.get('mustBeAutomaticallyDeleted')?.setValue(true)
      this.selectedFile = null;
    }

    // Create and Update form
    private createEvent() {
      const newEvent = this.newEvent;
      this.eventsService.postNewEvent(newEvent).subscribe((resp) => {
        if (resp) {
          this.uploadFile(resp._id!);
          this.dashboardService.notificationPopup('success','Evento agregado',2000)
          this.resetForm();
          this.router.navigateByUrl('lmdr/events');
          this.newElementAdded.emit();
        }else{
          this.dashboardService.notificationPopup('error','algo ocurrio al guardar el evento',2000)
        }
        this.uploadingEvent = false;
      });
    }

    private updateEvent() {
      const actualizedEvent = { ...this.newEvent, section: Section.EVENTS };
      this.eventsService.editEvent(this.eventId, actualizedEvent as EditEventManija).subscribe((resp) => {
        if (resp) {
          if(this.selectedFile !== null){
            this.uploadFile(this.currentEvent._id!);
            this.myForm.get('img')?.reset();
          }
          this.dashboardService.notificationPopup('success', 'Evento actualizado correctamente', 2000);
          this.getEvent();
        } else {
          this.dashboardService.notificationPopup("error", 'Algo salió mal al actualizar el Evento :(', 3000);
        }
        this.uploadingEvent = false;
      });
    }

    uploadFormData(formData: FormData, _id: string){
      if(formData){
        this.eventsService.postEventImage(_id!, formData).subscribe(imgResp=>{

          if(!imgResp){
            this.uploadingEvent = false
            this.dashboardService.notificationPopup("error", 'El Evento fue guardado, pero algo salio mal al guardar la/s imagen/es revisa q su formato sea valido :(',3000)
          }
          this.dashboardService.notificationPopup('success','Evento agregado',2000)
          this.resetForm()
          this.getEvent();
        });
      }
    }

    private uploadFile(eventId: string) {
      if (this.selectedFile == null) {
        console.log("No file selected, upload image canceled.");
        return;
      }
      this.uploadImg(eventId, Section.EVENTS, this.selectedFile);
    }

    uploadImg(id: string , section:Section, selectedFiles: FileList){

      if(id && selectedFiles){
        const formData = this.dashboardService.formDataToUploadSingleImg(section, selectedFiles![0]);
        if (formData && formData.has('file')) {
          this.uploadFormData(formData!, id);
        }
        this.dashboardService.notificationPopup('success','Evento agregado',2000)
      return false;
    }
    else{
      this.dashboardService.notificationPopup("error", 'Algo salio mal al Guardar el Evento :(',3000);
      return false;
      }
  }

    //DELETE IMG SECTION

    showDeleteBtn(imgName: string | ArrayBuffer, event:EventManija, id:string){
      if(!event) return false;
      return this.dashboardService.showDeleteBtn(imgName, event.imgName, id)
    }

    private confirmDelete() {
      return Swal.fire({
        title: 'Quieres eliminar la imagen?',
        text: "",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, save it!'
      });
    }

    public getImagePaths(imgN: string, id: string) {
      return this.dashboardService.getImagePaths(imgN, id)
    }

    private cleanEventImgName() {
      this.eventsService.editEvent(this.currentEvent._id!, { imgName:'' }).subscribe((editResp) => {
        if (editResp) {
          this.dashboardService.notificationPopup('success', 'La imagen se ha eliminado correctamente', 2000);
          this.resetForm();
          this.getEvent();
        }
      });
    }

    deleteImg(imgN: string) {
      this.confirmDelete().then((result) => {
        if (!result.isConfirmed) return;

        const { path, optimizePath } = this.getImagePaths(imgN, this.currentEvent._id!);
        this.dashboardService.deleteItemImg(path, Section.EVENTS)?.subscribe((resp) => {
          this.cleanEventImgName();
          if (resp) {
            this.dashboardService.deleteItemImg(optimizePath, Section.EVENTS)?.subscribe();
          }else{
            this.dashboardService.notificationPopup('error', 'Algo ocurrio al eliminar la imagen', 2000);
          }
        });
      });
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
          this.uploadingEvent = true;
          action === 'create' ? this.createEvent() : this.updateEvent();
        }
      });
    }

}

