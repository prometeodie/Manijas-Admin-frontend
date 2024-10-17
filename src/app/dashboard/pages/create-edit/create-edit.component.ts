import { Component, inject, OnInit } from '@angular/core';
import { EventsService } from '../../services/events.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit.component.html',
  styleUrls: ['./create-edit.component.scss']
})
export class CreateEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public seccion: string | null = '';
  public title: string ='Nuevo';
  public id = '';

  // TODO: tomar la seccion del url y con eso filtrar que metodo para traer evento, board,about,etc y crear variable con cada uno de esoscon usando los interface e injectarlos en los standalone, si no tiene id espara agregar uno nuevo en vase a la seccioin

  ngOnInit(){
    this.route.paramMap.subscribe(params => {
       this.id = params.get('id')!;
      (this.id) ? this.title = `Editar`: this.title = `Nuevo`;
    });
    this.route.paramMap.subscribe(params => {
      const seccion = params.get('section');
      (seccion) ? this.seccion = seccion: this.seccion = null;
    });
  }

}

