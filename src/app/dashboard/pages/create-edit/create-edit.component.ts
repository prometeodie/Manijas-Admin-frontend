import { Component, inject, OnInit } from '@angular/core';
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit.component.html',
  styleUrls: ['./create-edit.component.scss']
})
export class CreateEditComponent implements OnInit {
  test = inject(EventsService);

  // TODO: tomar la seccion del url y con eso filtrar que metodo para traer evento, board,about,etc y crear variable con cada uno de esoscon usando los interface e injectarlos en los standalone, si no tiene id espara agregar uno nuevo en vase a la seccioin

  ngOnInit(): void {
    this.test.getEvent('66a436ccbbf8f93399d4559c').subscribe(console.log)
  }
}
