import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormService } from 'src/app/services/form-validator.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  public emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  public passwordPattern: string ="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,20}$";
  public existLoginError: boolean = false;
  public chekingCredentials: boolean = false;

  public typeOfInput = 'password';
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private fvService = inject(FormService);

  public myForm = this.fb.group({
    email:['franco.d.r1992@gmail.com',[Validators.required, Validators.pattern(this.emailPattern)]],
    password:['Wishmaster7$',[Validators.required,Validators.minLength(8),Validators.maxLength(20), Validators.pattern(this.passwordPattern)]]
  })

  isValidField(field: string):boolean | null{
     return this.fvService.isValidField(this.myForm,field);
  }

  showError(field: string):string | null{
    return `${this.fvService.showError(this.myForm,field)}`
  }

  login(){
    const { email, password } = this.myForm.value;
    this.chekingCredentials = true;
      this.authService.login(email!, password!).subscribe({
        next: () => {
          this.existLoginError = false;
          this.router.navigateByUrl('/dashboard/boardgames')
        },
        error: (err)=>{
          this.existLoginError= true;
          if(err === 'Invalid credentials'){
            this.showErrorSwal(`Credenciales no validas`);
          }else{
            this.showErrorSwal(`Ocurrió un error inesperado`);
          }
          this.chekingCredentials = false;
        },
        complete: () => this.chekingCredentials = false,
      })
  }

  showErrorSwal(text:string ){
    Swal.fire({
      position: "center",
      icon: "error",
      title: `${text}`,
      showConfirmButton: false,
      timer: 1000
    });
  }

  togglePassword(){
    (this.typeOfInput === 'password')? this.typeOfInput = 'text' : this.typeOfInput = 'password';
  }

}

