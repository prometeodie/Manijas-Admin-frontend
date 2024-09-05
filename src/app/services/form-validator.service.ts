import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  readonly urlRegEx = /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
  readonly instaUrlRegEx = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv|stories)\/[A-Za-z0-9_-]+\/?$|^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?$/;
  readonly tikTokUrlRegEx = /^(https?:\/\/)?(www\.)?(tiktok\.com)\/(@[a-zA-Z0-9._-]+\/video\/\d+|t\/[a-zA-Z0-9._-]+|embed\/[a-zA-Z0-9._-]+|v|video\/\d+)(\/)?(\?.*)?$/;

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
        howToPlayUrl:'Debe introducir un link valido',
        url:'Debe introducir un link valido',
        reelInstagram:'Debe introducir un link de Instagram valido',
        reelTikTok: 'Debe introducir un link de Tik-Tok valido'
      };

    const errorMenssages:any = {
      required: 'This field is required',
      minlength:`Minimo de Caracteres ${errors['minlength']?.requiredLength}`,
      maxlength:`Maximo de Caracteres ${errors['maxlength']?.requiredLength}`,
      min:`Valor minimo permitido ${errors['min']?.min}`,
      max:`Valor maximo permitido ${errors['max']?.max}`,
      pattern:`${invalidPatternMessages[field]}`,
      invalidDate:'Formato de Fecha no valido',
      pastDate:'La fecha debe ser menor a la actual o podes volver al pasado gil?',
      fileSizeExceeded:'El tamaño de la imagen no debe superar los 3MB',
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
