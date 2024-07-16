import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgPipePipe } from '../../pipes/img-pipe.pipe';

@Component({
  selector: 'event-form',
  standalone: true,
  imports: [CommonModule, ImgPipePipe],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent {

  public colors: string[] = [
'rgb(255, 220, 0)',     // Amarillo dorado
'rgb(255, 100, 200)',   // Rosa claro
'rgb(200, 50, 255)',    // Violeta
'rgb(50, 255, 150)',    // Verde azulado claro
'rgb(0, 213, 156)',     // Verde azulado
'rgb(0, 255, 200)',     // Verde azul claro
'rgb(24, 220, 255)',    // Azul claro
'rgb(0, 150, 255)',     // Azul
'rgb(0, 100, 255)',     // Azul intenso
'rgb(0, 255, 100)',     // Verde claro
'rgb(135, 46, 110)',    // Púrpura oscuro
'rgb(255, 75, 75)',     // Rojo claro
'rgb(255, 50, 150)']
public selectedColor: string = this.colors[0];

  updateSelectedColor(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedColor = selectElement.value;
  }

}











