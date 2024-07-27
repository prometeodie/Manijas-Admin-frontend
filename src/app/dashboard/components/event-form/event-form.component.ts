import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgPipePipe } from '../../pipes/img-pipe.pipe';
import { EventManija } from '../../interfaces/event.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormService } from 'src/app/services/form-validator.service';
import { EventInput } from './interface/input.interface';
import { EventsService } from '../../services/events.service';
import { DashboardService } from '../../services/dashboard.service';
import { EventCardSample } from '../../interfaces';

@Component({
  selector: 'event-form',
  standalone: true,
  imports: [CommonModule, ImgPipePipe, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent {

  private fb = inject(FormBuilder);
  private fvService = inject(FormService);
  private eventsService = inject(EventsService);
  private dashboardService = inject(DashboardService);
  public  autoDeleteChecked: boolean = true;
  public  showPopUpAutoDelete: boolean = false;
  private TIME_REGEX = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
  public  imgSrc:string | ArrayBuffer | null ='';
  public colors: string[] = ['#ff3296', '#ff4b4b', '#872e6e', '#00ff64', '#0064ff', '#0096ff', '#18dcff', '#00ffc8', '#00d59c', '#32ff96', '#c832ff', '#ff64c8', '#ffdc00']
  public selectedColor: string = this.colors[0];
  public saveOrPublish:string = 'Guardar';
  public eventInputs: EventInput[] = [
    { name: 'title', placeHolder: 'Titulo', label: '', type: 'text', showIfAutoDelete: null, maxLenght: 24 },
    { name: 'eventDate', placeHolder: 'Fecha', label: 'Selecciona una fecha', type: 'date', showIfAutoDelete: true, maxLenght: null },
    { name: 'alternativeTxtEventDate', placeHolder: 'Fecha alternativa Ej(Todos los Domingos)', label: '', type: 'text', showIfAutoDelete: false, maxLenght: null },
    { name: 'startTime', placeHolder: 'hh:mm a.m./p.m.', label: 'Horario de inicio', type: 'time', showIfAutoDelete: null, maxLenght: null },
    { name: 'finishTime', placeHolder: 'hh:mm a.m./p.m.', label: 'Horario de finalización', type: 'time', showIfAutoDelete: null, maxLenght: null },
    { name: 'eventPlace', placeHolder: 'Lugar', label: '', type: 'text', showIfAutoDelete: null, maxLenght: 50 },
    { name: 'url', placeHolder: 'Url relacionado al evento', label: '', type: 'text', showIfAutoDelete: null, maxLenght: null },
    { name: 'eventImg', placeHolder: '', label: 'Seleccionar una imagen', type: 'file', showIfAutoDelete: null, maxLenght: null }
  ];

  public myForm = this.fb.group({
      title:                     ['',[Validators.required, Validators.maxLength(24)]],
      eventDate:                      ['',{validators:[Validators.required, this.eventsService.isValidDate()]}],
      alternativeTxtEventDate:   ['',[]],
      startTime:                 ['',[Validators.required, Validators.pattern(this.TIME_REGEX)]],
      finishTime:                ['',[Validators.required, Validators.pattern(this.TIME_REGEX)]],
      eventPlace:                ['',[Validators.maxLength(50)]],
      eventColor:                ['#ff3296',[]],
      url:                       ['',[]],
      publish:                   [false ,[Validators.required]],
      mustBeAutomaticallyDeleted:[true ,[Validators.required]],
      eventImg:                  ['',[]],
    })

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
      this.imgSrc = await this.dashboardService.onFileSelected(event);
      this.dashboardService.loadImage(this.imgSrc);
    }

    onFieldChange(field: string, event: Event) {
      const input = event.target as HTMLInputElement;
      this.eventsService.updateEventData({ [field as keyof EventCardSample]: input.value });
    }

   updateValidators() {
      const date = this.myForm.get('date');
      const alternativeTxtEventDate = this.myForm.get('alternativeTxtEventDate');
        if (this.myForm.get('autoDelete')?.value){
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


    onSubmit(){
      this.myForm.markAllAsTouched();
      if(this.myForm.invalid) return;
      alert('cargando evento');
      this.myForm.reset()
      this.eventsService.resetAllProperties()
    }
}











