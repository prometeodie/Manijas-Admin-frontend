import {  computed, Injectable, signal } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EventCardSample } from '../interfaces/event-card-sample.interface';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private _eventCardSample = signal<EventCardSample | null>({
    title: 'Example Title',
    date:  '--/--/----',
    alternativeTxtEventDate: 'Ej: Todos los Domingos',
    startTime: '--:--',
    finishTime: '--:--',
    place:'no where',
    color:'#ff3296',
    autoDelete: false,
    url: '',
  });
  public  eventCardSample = computed(()=>this._eventCardSample())



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
}
