import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ManijometroService } from '../../services/manijometro.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Manijometro, ManijometroPool } from '../../interfaces';
import { DashboardService } from '../../services/dashboard.service';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ManijometroValues } from '../../interfaces/boards interfaces/manijometro-pool.interface';
import { FormService } from 'src/app/services/form-validator.service';

@Component({
  selector: 'app-game-manijometro',
  templateUrl: './game-manijometro.component.html',
  styleUrls: ['./game-manijometro.component.scss']
})
export class GameManijometroComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private manijometroServices = inject(ManijometroService);
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private fb = inject(FormBuilder);
  private fvService = inject(FormService);
  public inputs: string[] = ["priceQuality", "gameplay", "replayability", "gameSystemExplanation"];
  public id!: string;
  public userId!: string;
  public manijometro!: Manijometro;
  public isLoading: boolean = false;
  public title!: string;


  public myForm = this.fb.group({
    priceQuality: [1,[Validators.required, Validators.min(1), Validators.max(100)]],
    gameplay: [1,[Validators.required, Validators.min(1), Validators.max(100)]],
    replayability: [1,[Validators.required, Validators.min(1), Validators.max(100)]],
    gameSystemExplanation: [1,[Validators.required, Validators.min(1), Validators.max(100)]],
  })

  ngOnInit(): void {
      this.isLoading = true;
      this.route.paramMap.subscribe(params => {
        this.id = params.get('id')!;
    });
    this.manijometroServices.getOneManijometro(this.id).subscribe(
      resp =>{
        if(resp){
          this.manijometro = resp;
          this.title = resp.title;
          this.updateFormValues(this.verifyUserVoted(resp));
        }
        else{
          this.dashboardService.notificationPopup('error','Algo Salio Mal',1500);
        }
        this.isLoading = false;
      }
    )
    this.userId = this.authService.currentUser()!._id;
  }

  private confirmAction(action: string) {
    return Swal.fire({
      title:"guardar votación?",
      text: "",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!'
    });
  }

  verifyUserVoted(manijometro: Manijometro){
    const userVotation = manijometro.manijometroPool.filter(pool=>{return pool.userId === this.userId});
    return userVotation[0];
  }

  private updateFormValues(manijometrUserPool: ManijometroPool) {

    if(manijometrUserPool){
      this.myForm.patchValue({
        priceQuality: manijometrUserPool.manijometroValuesPool.priceQuality ?? 1,
        gameplay:manijometrUserPool.manijometroValuesPool.gameplay ?? 1,
        replayability:manijometrUserPool.manijometroValuesPool.replayability ?? 1,
        gameSystemExplanation:manijometrUserPool.manijometroValuesPool.gameSystemExplanation ?? 1
    });
    }
  }

  getAverage(): number {
    const values = this.myForm.getRawValue();
    const sum = Object.values(values).reduce((acc, curr) => acc! + curr!, 0);
    const average = sum! / Object.keys(values).length;
    return average;
  }

  isValidField(field: string):boolean | null{
    return this.fvService.isValidField(this.myForm,field);
  }

  showError(field: string):string | null{
    return `${this.fvService.showError(this.myForm,field)}`
  }

  splitByUppercase(text: string){
    return this.manijometroServices.splitByUppercase(text);
  }


  onSubmit(){
    this.myForm.markAllAsTouched();
    if (this.myForm.invalid) return;
    const action = true ? 'update' : 'create';
    this.confirmAction(action).then((result) => {
      if (result.isConfirmed) {
       this.isLoading = true;
       const formValues = {totalManijometroUserValue: this.getAverage(), manijometroValuesPool: this.myForm.value as ManijometroValues, userId:this.userId }
       this.manijometroServices.patchOneManijometro(this.manijometro._id,formValues).subscribe(resp =>{
        if(resp){
          this.dashboardService.notificationPopup('success','El manijometro se actualizo correctamente', 1500);
          this.isLoading = false;
        }
       })
      }
    });
    this.isLoading = false;
  }
}
