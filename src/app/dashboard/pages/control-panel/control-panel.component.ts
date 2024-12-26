import { Component } from '@angular/core';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {
  readonly btns = ['cambiar contraseña', 'Cargar nuevo Usuario', 'Modificar Usuario'];
}
