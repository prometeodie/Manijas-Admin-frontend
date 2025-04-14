import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CardTemplate } from '../../interfaces/card interface/cards.interface';
import { DashboardService } from '../../services/dashboard.service';
import { EventsService } from '../../services/events.service';
import { map, Subscription } from 'rxjs';
import { EventManija } from '../../interfaces';
import { trigger, style, animate, transition, state } from '@angular/animations';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
   animations: [
      trigger('enterState',[
        state('void',style({
          transform: 'scale(0.98',
          opacity:0
        })),
        transition(':enter',[
          animate('300ms ease-in',style({
            transform: 'scale(1)',
            opacity:1
          }))
        ])
      ])
    ]
})
export class EventsComponent implements OnInit,OnDestroy {

  readonly eventPath = '/lmdr/create-edit/EVENTS';
  private dashboardService = inject(DashboardService);
  private eventsService = inject(EventsService);
  private eventsSub: Subscription = new Subscription();
  public imgSrc = this.dashboardService.imgSrc;
  public eventSample = this.eventsService.eventCardSample;
  public events: CardTemplate[] = [];
  public isLoading:boolean = false;


  ngOnInit(): void {
    this.actualizeElements();
  }

  ngOnDestroy(): void {
    this.dashboardService.cleanImgSrc();
    this.eventsSub.unsubscribe();
  }

  actualizeElements(){
    this.isLoading = true;
    this.eventsService.getAllEvents().pipe(
      map(event=> event!.map(event=>this.transformData(event)))
    ).subscribe(
      events=>{
        this.events = events
      }
    )
    this.isLoading = false;
  }

  onCardDelete(){
   this.actualizeElements();
  }

  onFormSubmit(){
    this.actualizeElements();
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
      imgMobileName,
      section,
      ...rest
    } = event;

    return {
      _id: _id!,
      title,
      imgName,
      imgMobileName,
      isInfoAList: false,
      info: {
        eventDate: eventDate? eventDate.toString() : '',
        alternativeTxtEventDate : '',
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
