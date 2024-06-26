import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { FormGroup, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  private http = inject(HttpClient);
  constructor() { }

  isValidField(myForm: FormGroup,field: string):boolean | null{
    return myForm.get(field)!.errors &&
           myForm.get(field)!.touched
  }

  showError(form: FormGroup, field: string):string | null{
    if (!form.contains(field)) return null;
    const errors = form.get(field)!.errors || {};
    let invalidPatternMessage: string = '';

    (field === 'email')? invalidPatternMessage = 'Example.1@example.com, Caracteres validos: ._ % -' :
                                                  invalidPatternMessage = `Al menos una letra minúscula y una mayúscula,
                                                                           Al menos un número,
                                                                           Al menos un caracter especial: !@#$%^&*.`;
    const errorMenssages:any = {
      required: 'This field is required',
      maxlength:`Maximo de Caracteres ${errors['maxlength']?.requiredLength}`,
      minlength:`Minimo de Caracteres ${errors['minlength']?.requiredLength}`,
      pattern:`${invalidPatternMessage}`
    }

    for (const key of Object.keys(errors)) {
        return errorMenssages[key];
    }
    return null;
  }

}
