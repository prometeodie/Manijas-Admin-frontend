import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-boardgames',
  templateUrl: './boardgames.component.html',
  styleUrls: ['./boardgames.component.scss']
})
export class BoardgamesComponent {
  public authService = inject(AuthService)
  public user = this.authService.currentUser()
  salir(){
    this.authService.logOutUser()
  }
}
