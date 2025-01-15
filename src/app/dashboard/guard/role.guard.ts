import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';


@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}
  private authService = inject(AuthService);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const section = route.params['section'];
    const userRole = this.authService.currentUser()?.roles[0];

    if (section === 'USERS' && userRole !== 'MASTER') {
      this.router.navigate(['lmdr/not-authorized']);
      return false;
    }

    return true;
  }
}
