import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { FormGroup, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  public  emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  private http = inject(HttpClient);
  constructor() { }

  isValidField(myForm: FormGroup,field: string):boolean | null{
    return myForm.get(field)!.errors &&
           myForm.get(field)!.touched
  }

  showError(form: FormGroup, field: string):string | null{
    if (!form.contains(field)) return null;
    const errors = form.get(field)!.errors || {};

    const errorMenssages:any = {
      required: 'This field is required',
      validAddres:'Select a valid addres',
      minlength:`Minimun lenght accepted ${errors['minlength']?.requiredLength}`,
      min:`Minimun value accepted ${errors['min']?.min}`,
      duplicateCode:`The code ${form.get(field)?.value} is already taken.`,
      pattern:'Invalid'
    }

    for (const key of Object.keys(errors)) {
        return errorMenssages[key];
    }
    return null;
  }

}
