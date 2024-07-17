import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgPipePipe } from '../../pipes/img-pipe.pipe';
import { EventManija } from '../../interfaces/event.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormService } from 'src/app/services/form-validator.service';
import { EventInput } from './interface/input.interface';

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
  public eventInputs: EventInput[] = [
    { name: 'title', placeHolder: 'Titulo', type: 'text' },
    { name: 'date', placeHolder: 'Fecha', type: 'date' },
    { name: 'schedule', placeHolder: 'Horario', type: 'time' },
    { name: 'place', placeHolder: 'Lugar', type: 'text' },
    { name: 'url', placeHolder: 'Url relacionado al evento', type: 'text' },
    { name: 'eventImg', placeHolder: '', type: 'file' }
  ];

  public myForm = this.fb.group({
    title:      ['',[Validators.required]],
    date:       ['',[Validators.required]],
    schedule:   ['',[Validators.required]],
    place:      ['',[]],
    color:      ['',[]],
    url:        ['',[]],
    publish:    [false ,[Validators.required]],
    autoDelete: [true,[Validators.required]],
    eventImg:   ['',[]],
  })


  private _eventExample = signal< EventManija|null>(null);
  public eventExample = computed(( )=> this._eventExample());

  public colors: string[] = [
    'rgb(255, 50, 150)',    // Rosa claro
    'rgb(255, 75, 75)',     // Rojo claro
    'rgb(135, 46, 110)',    // Púrpura oscuro
    'rgb(0, 255, 100)',     // Verde claro
    'rgb(0, 100, 255)',     // Azul intenso
    'rgb(0, 150, 255)',     // Azul
    'rgb(24, 220, 255)',    // Azul claro
    'rgb(0, 255, 200)',     // Verde azul claro
    'rgb(0, 213, 156)',     // Verde azulado
    'rgb(50, 255, 150)',    // Verde azulado claro
    'rgb(200, 50, 255)',    // Violeta
    'rgb(255, 100, 200)',   // Rosa claro
    'rgb(255, 220, 0)'      // Amarillo dorado
  ]
public selectedColor: string = this.colors[0];

  updateSelectedColor(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedColor = selectElement.value;
  }

  isValidField(field: string):boolean | null{
    return this.fvService.isValidField(this.myForm,field);
 }

 showError(field: string):string | null{
   return `${this.fvService.showError(this.myForm,field)}`
 }

onSubmit(){
  alert('cargando evento');
}

}











