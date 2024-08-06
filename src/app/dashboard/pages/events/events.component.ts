import { Component, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { CardTemplate } from '../../interfaces/cards.interface';
import { DashboardService } from '../../services/dashboard.service';
import { EventsService } from '../../services/events.service';
import { map } from 'rxjs';
import { EventManija } from '../../interfaces';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit,OnDestroy {

  readonly eventPath = '/lmdr/create-edit/EVENTS';
  private dashboardService = inject(DashboardService);
  private eventsService = inject(EventsService);
  public imgSrc = this.dashboardService.imgSrc;
  public eventSample = this.eventsService.eventCardSample;
  public events: CardTemplate[] = [];
  // TODO: hacer la peticion para traer todos los eventos, borrar eventos, cargar nuevos eventos, borrar img de eventos, editar eventos

  ngOnInit(): void {
    this.eventsService.getAllEvents().pipe(
        map(event=> event!.map(event=>this.transformData(event)))
    ).subscribe(
      events=>{this.events = events}
    )
  }

  ngOnDestroy(): void {
    this.dashboardService.cleanImgSrc()
  }

  onCardDelete(){
    this.eventsService.getAllEvents().pipe(
      map(event=> event!.map(event=>this.transformData(event)))
  ).subscribe(
    events=>{this.events = events})
  }

  private transformData(event: EventManija): CardTemplate {
    const {
      _id,
      title,
      eventDate,
      alternativeTxtEventDate,
      startTime,
      finishTime,
      eventPlace,
      publish,
      imgName,
      section,
      ...rest
    } = event;

    return {
      _id: _id!,
      title,
      imgPath: imgName,
      isInfoAList: false,
      info: {
        eventDate: eventDate.toString(),
        alternativeTxtEventDate,
        startTime,
        finishTime,
        eventPlace
      },
      section,
      publish,
      ...rest
    };
  }
}
