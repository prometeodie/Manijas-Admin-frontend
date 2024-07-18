import {  Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor() { }


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

}
