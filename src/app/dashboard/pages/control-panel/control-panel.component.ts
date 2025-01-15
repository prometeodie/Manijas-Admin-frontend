import { Component, inject, OnInit } from '@angular/core';
import { ControlPanelService } from '../../services/control-panel.service';
import { User } from 'src/app/auth/interfaces';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Roles } from '../../interfaces';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnInit{
  private controlPanelService = inject(ControlPanelService);
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  readonly btns = ['cambiar contraseña', 'Modificar Usuario'];
  readonly newUserPath: string = '/lmdr/create-edit/USERS';
  public selectedBtn = 'cambiar contraseña';
  public loading: boolean = false;
  public users: User[] = [];
  public currenUserRol!: string;
  public masterRole: Roles = Roles.MASTER;

  ngOnInit(): void {
    this.currenUserRol = this.authService.currentUser()!.roles[0];
  }

  FilterBtns(btn: string){
    if(btn === 'Modificar Usuario') {
      return this.currenUserRol === this.masterRole;
    }else{
      return this.currenUserRol === Roles.MASTER || this.currenUserRol === Roles.ADMIN || this.currenUserRol === Roles.USER;
    }
  }

  getAllUsers(btn:string){
    this.selectedBtn = btn;
    if(btn !== 'Modificar Usuario') return;
    this.loading = true;
    this.controlPanelService.getAlUsers().subscribe((resp)=>{
      if(resp){
        this.users = resp
      }else{
        this.dashboardService.notificationPopup('error', 'Error al cargar los usuarios', 1500);
      }
    });
    this.loading = false;
  }

  onCardDelete(){
    this.getAllUsers('Modificar Usuario');
  }
}
