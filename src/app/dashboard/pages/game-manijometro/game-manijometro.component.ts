import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ManijometroService } from '../../services/manijometro.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Manijometro } from '../../interfaces';
import { DashboardService } from '../../services/dashboard.service';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

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
  public inputs: string[] = ['value1', 'value2', 'value3', 'value4','value5'];
  public id!: string;
  public userId!: string;
  public manijometro!: Manijometro;
  public isLoading: boolean = false;
  public title!: string;


  public myForm = this.fb.group({
    value1: [0],
    value2: [0],
    value3: [0],
    value4: [0],
    value5: [0]
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
        }
        else{
          this.dashboardService.notificationPopup('error','Algo Salio Mal',1500);
        }
        this.isLoading = false;
        console.log(this.manijometro)
        // TODO:hacer para cargar los vlaores en el input si la persiona voto
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

  onSubmit(){
    this.myForm.markAllAsTouched();
    if (this.myForm.invalid) return;
    const action = true ? 'update' : 'create';
    this.confirmAction(action).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
       alert('votaste')
       this.isLoading=false;
      //  TODO: cambiar el false dentro de la funcion q va ag=ahcer la peticion
      }
    });
  }
}
