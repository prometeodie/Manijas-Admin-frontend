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
  public passwordPattern: string ="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,20}$";

  public isCredentialClosed:boolean = true;
  public typeOfInput = 'password';
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private fvService = inject(FormService);

  public myForm = this.fb.group({
    email:['admin@admin.com',[Validators.required, Validators.pattern(this.emailPattern)]],
    password:['Manija$12',[Validators.required,Validators.minLength(8),Validators.maxLength(20), Validators.pattern(this.passwordPattern)]]
  })

  isValidField(field: string):boolean | null{
     return this.fvService.isValidField(this.myForm,field);
  }

  showError(field: string):string | null{
    return `${this.fvService.showError(this.myForm,field)}`
  }

  togglePassword(){
    (this.typeOfInput === 'password')? this.typeOfInput = 'text' : this.typeOfInput = 'password';
  }

  login(){

    this.router.navigateByUrl('/dashboard/boardgames')
  }
}

