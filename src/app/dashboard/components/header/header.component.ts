import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'component-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent   {

  private authService = inject(AuthService);
  public userEmail:string = this.authService.currentUser()?.nickname!;
  public userRole:string = this.authService.currentUser()?.roles[0]!;

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
