import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from 'src/app/auth/interfaces';
import { CreateEditUserService } from '../../services/create-edit-user.service';
import { ControlPanelService } from '../../services/control-panel.service';
import { DashboardService } from '../../services/dashboard.service';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'user-card',
  standalone: true,
  imports: [CommonModule, LoadingAnimationComponent, RouterModule],
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent implements OnInit, OnDestroy {
  @Input() user!: User;
  @Output() delete = new EventEmitter<void>();
  private createEditUserService = inject(CreateEditUserService)
  private controlPanelService = inject(ControlPanelService)
  private dashboardService = inject(DashboardService)
  private userCardSub: Subscription = new Subscription();
  public loading: boolean = false;
  public userEditRoute:string = ``;

  ngOnInit(): void {
    this.userEditRoute = `/lmdr/create-edit/USERS/${this.user._id}`;
  }

  ngOnDestroy(): void {
    this.userCardSub.unsubscribe();
  }

  deleteUser(){
    this.controlPanelService.confirmAction('Estas Seguro que deseas eleminiar este usuario?').then((result) => {
      this.loading = true;
      this.userCardSub = this.createEditUserService.deleteUser(this.user._id).subscribe(resp=>{
        if(resp){
         this.dashboardService.notificationPopup('success','Usuario eliminado con exito', 1500)
         this.delete.emit();
        }else{
          this.dashboardService.notificationPopup('error','Error al eliminar el usuario', 1500)
        }
      })
      this.loading = false;
    })
  }
}
