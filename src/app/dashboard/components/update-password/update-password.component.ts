import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormService } from 'src/app/services/form-validator.service';
import { Inputs } from '../../interfaces';
import { ControlPanelService } from '../../services/control-panel.service';
import { DashboardService } from '../../services/dashboard.service';
import { LoadingAnimationComponent } from "../loading-animation/loading-animation.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'update-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingAnimationComponent],
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent implements OnDestroy{
  readonly inputs : Inputs[] = [{controlName:'currentPassword', placeholder:'Contraseña Actual', typeInput:'password'},
    {controlName:'newPassword', placeholder:'Nueva Contraseña',typeInput:'password'},
    {controlName:'repeatNewPassword', placeholder:'Repetir Nueva Contraseña',typeInput:'password'} ];
    private fb = inject(FormBuilder);
    private fvService = inject(FormService);
    private dashboardService = inject(DashboardService);
    private controlPanelService = inject(ControlPanelService);
    private passworsSub: Subscription = new Subscription();
    readonly passwordPattern = this.fvService.passwordPattern;
    public loadingChanges: boolean = false;

  ngOnDestroy(): void {
    this.passworsSub.unsubscribe();
  }

public myForm = this.fb.group({
    currentPassword:          ['', [Validators.required, Validators.min(8), Validators.max(20), Validators.pattern(this.passwordPattern)]],
    newPassword:              ['', [Validators.required, Validators.min(8), Validators.max(20), Validators.pattern(this.passwordPattern)]],
    repeatNewPassword:        ['', [Validators.required, Validators.min(8), Validators.max(20), Validators.pattern(this.passwordPattern)]],
  },{
    validators: this.fvService.passwordMatchValidator('newPassword', 'repeatNewPassword')
  })

  isValidField(field: string):boolean | null{
    return this.fvService.isValidField(this.myForm,field);
  }

  showError(field: string):string | null{
    return `${this.fvService.showError(this.myForm,field)}`
  }

  togglePassword(indice:number){
    this.inputs[indice].typeInput = this.inputs[indice].typeInput === 'password' ? 'text' : 'password';
  }

  onSubmit(){
    this.myForm.markAllAsTouched();
    if (this.myForm.invalid) return;

    this.controlPanelService.confirmAction('¿Estas seguro de que quieres cambiar la contraseña?').then((result) => {
    if (!result.isConfirmed) return;
      this.loadingChanges = true;

      const {currentPassword, newPassword} = this.myForm.value;

      if (!currentPassword || !newPassword) {
        return;
      }

      this.passworsSub = this.controlPanelService.userChangesPassword({currentPassword, newPassword}).subscribe((res)=>{
        if (res) {
          this.dashboardService.notificationPopup('success','Contraseña actualizada con exito', 1500);
          this.togglePassword(0);
          this.togglePassword(1);
          this.togglePassword(2);
          this.myForm.reset();
        }else{
          this.dashboardService.notificationPopup('error','Algo salio mal :(', 1500);
        }
      })
      this.loadingChanges = false;
    })
  }

}
