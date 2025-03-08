import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  readonly urlRegEx = /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
  readonly emailPattern = "^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  readonly passwordPattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,20}$';
  readonly instaUrlRegEx = /^https:\/\/www\.instagram\.com\/.+$/;
  readonly tikTokUrlRegEx = /^https:\/\/www\.tiktok\.com\/.+$/;
  readonly passwordPatternMessage = `Al menos una letra minúscula y una mayúscula,
                   Al menos un número,
                   Minimo 8 caracteres,
                   Maximo 20 caracteres,
                   Al menos un caracter especial: !@#$%^&*.`;


  constructor() { }

  isValidField(myForm: FormGroup,field: string):boolean | null{
    return myForm.get(field)!.errors &&
           myForm.get(field)!.touched
  }

  passwordMatchValidator(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (form: AbstractControl) => {
      const password = form.get(passwordField)?.value;
      const confirmPassword = form.get(confirmPasswordField)?.value;

      if (password !== confirmPassword) {
        form.get(confirmPasswordField)?.setErrors({ passwordMismatch: true });
      } else {
        form.get(confirmPasswordField)?.setErrors(null);
      }

      return null;
    };
  }


  showError(form: FormGroup, field: string):string | null{
    if (!form.contains(field)) return null;
    const errors = form.get(field)!.errors || {};

    const invalidPatternMessages: { [key: string]: string } = {
        email: 'Example.1@example.com, Caracteres validos: ._%@-',
        password: this.passwordPatternMessage,
        currentPassword: this.passwordPatternMessage,
        newPassword: this.passwordPatternMessage,
        repeatNewPassword: this.passwordPatternMessage,
        startTime: 'Debe introducir una hora válida',
        howToPlayUrl:'Debe introducir un link valido',
        url:'Debe introducir un link valido',
        reelInstagram:'Debe introducir un link de Instagram valido',
        reelTikTok: 'Debe introducir un link de Tik-Tok valido'
      };

    const errorMenssages:any = {
      duplicated: 'Este email ya esta registrado',
      fileSizeExceeded:'El tamaño de la imagen no debe superar los 3MB',
      invalidDate:'Formato de Fecha no valido',
      max:`Valor maximo permitido ${errors['max']?.max}`,
      maxlength:`Maximo de Caracteres ${errors['maxlength']?.requiredLength}`,
      min:`Valor minimo permitido ${errors['min']?.min}`,
      minlength:`Minimo de Caracteres ${errors['minlength']?.requiredLength}`,
      passwordMismatch:'Las contraseñas no coinciden',
      pastDate:'La fecha no debe ser menor a la actual o podes volver al pasado gil?',
      pattern:`${invalidPatternMessages[field]}`,
      required: 'Este campo es requerido'
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
