import {  computed, inject, Injectable, signal } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EventCardSample } from '../interfaces/event-card-sample.interface';
import { DashboardService } from './dashboard.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/assets/environments/environment';
import { EventManija } from '../interfaces';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private eventPlaceHolder = {
    title: 'Example Title',
    eventDate:  '--/--/----',
    alternativeTxtEventDate: 'Ej: Todos los Domingos',
    startTime: '--:--',
    finishTime: '--:--',
    eventPlace:'no where',
    eventColor:'#ff3296',
    mustBeAutomaticallyDeleted: false,
    url: '',
  }

  private _eventCardSample = signal<EventCardSample | null>(this.eventPlaceHolder);
  public  eventCardSample = computed(()=>this._eventCardSample())
  private dashboardService= inject(DashboardService);
  private http = inject(HttpClient);
  readonly url = `${environment.baseUrl}/events`



  isValidDate(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const date = new Date(value);
      const isValid = !isNaN(date.getTime());

      return isValid ? null : { invalidDate: true };
    };
  }

  updateEventData(newData: Partial<EventCardSample>) {
    this._eventCardSample.update(data => ({ ...data!, ...newData! }));
  }

  resetpropertie(autoDelete:boolean){
    this._eventCardSample.update((eventCardSample) => {
      if (eventCardSample) {
        return (autoDelete)? { ...eventCardSample, date: '--/--/----' }:{ ...eventCardSample, alternativeTxtEventDate: 'Ej: Todos los Domingos' };
      }
      return eventCardSample;
    });
  }

  resetAllProperties(){
    this.updateEventData(this.eventPlaceHolder)
  }

  getAllEvents(){
    const headers = this.dashboardService.getHeaders();

    return this.http.get<EventManija[]>(`${this.url}`, { headers}).pipe(
      catchError((err)=>{return of(undefined)})
    )

  }

  getEvent(id:string){
    const headers = this.dashboardService.getHeaders();

    return this.http.get<EventManija[]>(`${this.url}/${id}`, { headers}).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

  postNewEvent(newEvent: EventManija){
    const headers = this.dashboardService.getHeaders();
    return this.http.post<EventManija>(`${this.url}/upload`, newEvent, { headers}).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

  postEventImage(id:string){
    const headers = this.dashboardService.getHeaders();
    return this.http.post<EventManija>(`${this.url}/uploadImg/:id`, { headers}).pipe(
      catchError((err)=>{return of(undefined)})
    )
  }

  editEvent(){
    // editar un evento
  }


}
