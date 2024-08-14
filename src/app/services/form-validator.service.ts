import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor() { }

  isValidField(myForm: FormGroup,field: string):boolean | null{
    return myForm.get(field)!.errors &&
           myForm.get(field)!.touched
  }


  showError(form: FormGroup, field: string):string | null{
    if (!form.contains(field)) return null;
    const errors = form.get(field)!.errors || {};

    const invalidPatternMessages: { [key: string]: string } = {
        email: 'Example.1@example.com, Caracteres validos: ._%@-',
        password: `Al menos una letra minúscula y una mayúscula,
                   Al menos un número,
                   Al menos un caracter especial: !@#$%^&*.`,
        startTime: 'Debe introducir una hora válida',
      };

    const errorMenssages:any = {
      required: 'This field is required',
      maxlength:`Maximo de Caracteres ${errors['maxlength']?.requiredLength}`,
      minlength:`Minimo de Caracteres ${errors['minlength']?.requiredLength}`,
      pattern:`${invalidPatternMessages[field]}`,
      invalidDate:'Formato de Fecha no valido',
      pastDate:'La fecha debe ser menor a la actual o podes volver al pasado gil?',
      fileSizeExceeded:'El tamaño de la imagen no debe superar los 3MB'
    }

    for (const key of Object.keys(errors)) {
        return errorMenssages[key];
    }
    return null;
  }

  avoidImgExceedsMaxSize(fileSize:number, maxSize:number){

    if (fileSize > maxSize) {
      return true;
    }
    return null;
  }

}
