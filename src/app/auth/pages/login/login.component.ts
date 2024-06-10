import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormService } from 'src/app/services/form-validator.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  public  emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  public  passwordPattern: string = "/^[a-zA-Z0-9!#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+$/";
  public isCredentialClosed:boolean = true;
  public typeOfInput = 'password';
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private fvService = inject(FormService);
// TODO:arreglar el passwordpatter q me queda disable el button
  public emailPatternMenssage: string = 'example.1@example.com, characters accepted:._ % -';
  public passwordPatternMenssage: string = 'Max 16.';

  public myForm = this.fb.group({
    email:['admin@admin.com',[Validators.required, Validators.pattern(this.emailPattern)]],
    password:['123456',[Validators.required, Validators.minLength(6), Validators.pattern(this.passwordPattern)]]
  })

  isValidField(field: string):boolean | null{
     return this.fvService.isValidField(this.myForm,field);
  }

  showError(field: string, pattern:string):string | null{
    return `${this.fvService.showError(this.myForm,field)}:${pattern}`
  }

  togglePassword(){
    (this.typeOfInput === 'password')? this.typeOfInput = 'text' : this.typeOfInput = 'password';
    console.log('entro al toggle')
  }

  login(){
    alert('te has logeado')
  }
}
