import { Component } from '@angular/core';
import { CardTemplate } from '../../interfaces/cards.interface';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent {
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
      imgPath:'../../../../assets/images.jpeg',
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
      info:['Dia/s: lalalalalala', 'Horario: 18:40hs', 'Lugar: arte y parte (yrigoyen 882 Mar Del Plata)'],
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
