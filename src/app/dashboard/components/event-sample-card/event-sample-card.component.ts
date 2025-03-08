import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'event-sample-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-sample-card.component.html',
  styleUrls: ['./event-sample-card.component.scss']
})
export class EventSampleCardComponent {
  private dashboardService = inject(DashboardService);
  private eventsService = inject(EventsService);
  public imgSrc = this.dashboardService.imgSrc;
  public eventSample = this.eventsService.eventCardSample;

  loadImg(event: Event){
    const loadClass = 'events__card__content__img--loaded'
    this.dashboardService.loadImg(event, loadClass)
  }
}
