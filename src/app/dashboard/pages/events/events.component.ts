import { Component, inject } from '@angular/core';
import { CardTemplate } from '../../interfaces/cards.interface';
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent {

  readonly eventPath = '/lmdr/create-edit/EVENT';
  private eventsService = inject(EventsService);
// TODO: hacer la peticion para traer todos los eventos,, borrar eventos,, cargar nuevos eventos, borrar img de eventos, editar eventos

  public eventos : CardTemplate[] = [
    {
      id:'asdasdd',
      title:' Luna Capital',
      imgPath:'../../../../assets/images.jpeg',
      isInfoAList:false,
      info:['Dia/s: lalalalalala', 'Horario: 18:40hs', 'Lugar: arte y parte (yrigoyen 882 Tandil)'],
      category:'EVENT',
      publish: false,
      manijometro:99,
      hasVoted:false,
     },{
      id:'asdgggggggggggggggggasdd',
      title:' Lafgafdgagfagfl',
      imgPath:'',
      isInfoAList:false,
      info:['Dia/s: lalalalalala', 'Horario: 18:40hs', 'Lugar: arte y parte (yrigoyen 882 Tandil)'],
      category:'EVENT',
      publish: false,
      manijometro:99,
      hasVoted:true,
     },{
      id:'ererereeerer',
      title:' Luna Capital',
      imgPath:'../../../../assets/images.jpeg',
      isInfoAList:false,
      info:['Dia/s: lalalalalala', 'Horario: 18:40hs', 'Lugar: arte y parte (yrigoyen 882 Mar Del Plata) (yrigoyen 882 Mar Del Plata (yrigoyen 882 Mar Del Plata (yrigoyen 882 Mar Del Plata'],
      category:'EVENT',
      publish: false,
      manijometro:99,
      hasVoted:false,
     },{
      id:'tttttttttttttttttt',
      title:' Luna ',
      imgPath:'../../../../assets/images.jpeg',
      isInfoAList:false,
      info:['Dia/s: lalalalalala', 'Horario: 18:40hs', 'Lugar: arte y parte (yrigoyen 882 Tandil)'],
      category:'EVENT',
      publish: false,
      manijometro:99,
      hasVoted:false,
     }
  ];
}
