import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { AuthStatus } from './auth/interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
  private authService = inject(AuthService);
  public router = inject(Router);

  constructor(){
    this.authService.checkAuthStatus().subscribe()
  }

  public finishedAuthCheck = computed<boolean>(() => {
    if(this.authService.authStatus() === AuthStatus.checking){
      return false;
    }
    return true;
  }
)
  public authStatusChangeEfect = effect(()=>{
    const authStatusActions = {
      [AuthStatus.checking]: () => {},
      [AuthStatus.authenticated]: () => {},
      [AuthStatus.noAuthenticated]: () => {this.router.navigateByUrl('/auth/login')}
    };

    const currentStatus = this.authService.authStatus();
    const action = authStatusActions[currentStatus];
    console.log(this.getUserRoute())
    if (action) {
      action();
    }
  })

  getUserRoute(): string{
    const url = localStorage.getItem('url');
    if(!url) return 'lmdr'

    return url;
  }
}
