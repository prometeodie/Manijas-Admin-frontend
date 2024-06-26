import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import Swal from 'sweetalert2';
import { DashboardService } from '../../services/dashboard.service';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'component-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent  implements OnInit {

  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  public userEmail:string = this.authService.currentUser()?.nickname!;
  public userRole:string = this.authService.currentUser()?.roles[0]!;
  public unreadMessages:number = 0;

  ngOnInit(): void {
    this.dashboardService.getUnreadMessageCount()?.pipe(
      map(unreadMessages => unreadMessages?.unreadMessages),
      catchError(error => {
        return of(0);
      })
    ).subscribe((unreadMessageCount) => {
      if (unreadMessageCount !== null) {
        this.unreadMessages = unreadMessageCount!;
      }
    });
  }

  logOut(){
    Swal.fire({
      title: 'Do you want to logOut?',
      text: "",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logOutUser();
      }
  })
}

alertTodo(message: string){
  alert(message)
}

}
