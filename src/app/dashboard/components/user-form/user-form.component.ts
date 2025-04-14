import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateUser, Inputs, Roles, UpdateUser } from '../../interfaces';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormService } from 'src/app/services/form-validator.service';
import { DashboardService } from '../../services/dashboard.service';
import { ControlPanelService } from '../../services/control-panel.service';
import { CreateEditUserService } from '../../services/create-edit-user.service';
import { User } from 'src/app/auth/interfaces/user.interface';
import { LoadingAnimationComponent } from "../loading-animation/loading-animation.component";
import { UserResponse } from '../../interfaces/user interface/user-responsee.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingAnimationComponent],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnDestroy{
  @Input() userId: string = '';
  private fb = inject(FormBuilder);
  private fvService = inject(FormService);
  private dashboardService = inject(DashboardService);
  private createEditUserService = inject(CreateEditUserService);
  private controlPanelService = inject(ControlPanelService);
  private userSubcriptions: Subscription = new Subscription();
  public uploadingUser: boolean = false;
  public action: string = 'create';
  public actionTitle: string = 'Crear Usuario';
  public currentUser!: UserResponse;
  readonly roles: Roles[] = [Roles.USER, Roles.ADMIN, Roles.MASTER];
  readonly inputs : Inputs[] = [
    {controlName:'email', placeholder:'Email', typeInput:'text'},
    {controlName:'name', placeholder:'Nombre', typeInput:'text'},
    {controlName:'surname', placeholder:'Apellido', typeInput:'text'},
    {controlName:'nickname', placeholder:'Apodo', typeInput:'text'},
    {controlName:'roles', placeholder:'', typeInput:''},
    {controlName:'password', placeholder:'Contraseña', typeInput:'password'},
    {controlName:'repeatPassword', placeholder:'Repetir Contraseña',typeInput:'password'} ];

    readonly passwordPattern = this.fvService.passwordPattern;

    public myForm = this.fb.group({
      email:['', [Validators.required, Validators.pattern(this.fvService.emailPattern)]],
      name:['', Validators.required],
      surname:['', Validators.required],
      nickname:['', Validators.required],
      roles:  [Roles.USER.toString(),],
      password:['', [Validators.required, Validators.min(8), Validators.max(20), Validators.pattern(this.passwordPattern)]],
      repeatPassword: ['', [Validators.required, Validators.min(8), Validators.max(20), Validators.pattern(this.passwordPattern)]],
    },{
      validators: this.fvService.passwordMatchValidator('password', 'repeatPassword'),
      updateOn: 'blur'
    } )

    ngOnInit(): void {
      if(this.userId){
        this.action = 'update';
        this.actionTitle = 'Editar Usuario';
        const sub = this.createEditUserService.getUser(this.userId).subscribe(resp=>{
          this.currentUser = resp;
          this.updateFormValues(this.currentUser);
        });
        const passwordControl = this.myForm.get('password');
        const repeatPasswordControl = this.myForm.get('repeatPassword');
        if(passwordControl && repeatPasswordControl){
          passwordControl.clearValidators();
          repeatPasswordControl.clearValidators();
          passwordControl.setValidators([Validators.min(8), Validators.max(20), Validators.pattern(this.passwordPattern)]);
          repeatPasswordControl.setValidators([Validators.min(8), Validators.max(20), Validators.pattern(this.passwordPattern)]);
        }
        this.userSubcriptions.add(sub);
      }
    }

    ngOnDestroy(): void {
      this.userSubcriptions.unsubscribe();
    }

    isValidField(field: string):boolean | null{
      return this.fvService.isValidField(this.myForm,field);
    }

    showError(field: string):string | null{
      return `${this.fvService.showError(this.myForm,field)}`
  }

  togglePassword(indice:number){
    const name = this.inputs[indice].controlName;
    if(name === 'password' || name === 'repeatPassword'){
    this.inputs[indice].typeInput = this.inputs[indice].typeInput === 'password' ? 'text' : 'password';
    }
  }

  createUser(){
    this.uploadingUser = true;
    const { repeatPassword, ...rest } = this.myForm.value;
    const newUser: CreateUser = {
      email: rest.email?.toLowerCase() ?? '',
      name: rest.name?.toLowerCase() ?? '',
      surname: rest.surname?.toLowerCase() ?? '',
      nickname: rest.nickname?.toLowerCase() ?? '',
      roles: rest.roles ?? Roles.USER.toString(),
      password: rest.password ?? '',
    };
    const sub = this.createEditUserService.createNewUser(newUser).subscribe({
      next: (resp) => {
        this.dashboardService.notificationPopup('success', 'Usuario creado con éxito', 1500);
        this.myForm.reset();
        this.myForm.get('roles')?.setValue(Roles.USER);
        this.uploadingUser = false;
      },
      error: (err) => {
        if (err.error?.code === 11000) {
          this.myForm.get('email')?.setErrors({ duplicated: true });
        } else {
          this.dashboardService.notificationPopup('error', 'Error inesperado al crear usuario. Inténtalo más tarde.', 3000);
        }
        console.error('Error al crear usuario:', err);
        this.uploadingUser = false;
      },
    });
    this.userSubcriptions.add(sub);
  }

    private updateFormValues(user: User) {
      this.myForm.patchValue({
        email: user.email,
        name: user.name,
        surname: user.surname,
        nickname: user.nickname,
        roles: user.roles[0],
      });
    };


  updateUser(){
    this.uploadingUser = true;
    const { repeatPassword, ...rest } = this.myForm.value;
    const user: UpdateUser = {
      email: rest.email?.toLowerCase() ?? '',
      name: rest.name?.toLowerCase() ?? '',
      surname: rest.surname?.toLowerCase() ?? '',
      nickname: rest.nickname?.toLowerCase() ?? '',
      roles: rest.roles ?? Roles.USER.toString(),
      password: rest.password ?? '',
    };

    if(user.password === ''){
      const {password,...restUser} = user;
      this.update(restUser);
    }else{
      this.update(user);
    }
    this.uploadingUser = false;
  }

  update(user: UpdateUser){
    const sub = this.createEditUserService.updateUser(this.userId, user ).subscribe(resp =>{
      (resp)?
        this.dashboardService.notificationPopup('success', 'Usuario actualizado con éxito', 1500):
        this.dashboardService.notificationPopup('error', 'Error inesperado al actualizar usuario. Inténtalo más tarde.', 1500);
    })
    this.userSubcriptions.add(sub);
  }
  private confirmAction(action: string) {
    return this.controlPanelService.confirmAction(action)
  }

  onSubmit(){
    this.myForm.markAllAsTouched();
    if (this.myForm.invalid) return;
    const action = this.currentUser ? 'update' : 'create';
    const message = (action === 'create')? 'crear Usuario' : 'actualizar Usuario';
    this.confirmAction(message).then((result) => {
      if (result.isConfirmed) {
        action === 'create' ? this.createUser() : this.updateUser();
      }
    });
  }
 }

