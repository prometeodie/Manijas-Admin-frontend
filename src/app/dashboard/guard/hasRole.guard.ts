import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';

export const hasRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoutes: string[]= route.data?.['allowedRoles'];
  const userRole = authService.currentUser()?.roles[0];
  localStorage.setItem('url', state.url);
  alert('entro al guard')

    if(authService.currentUser() && allowedRoutes.includes(userRole!)){
      return true;
    }

    router.navigateByUrl('lmdr');
    return false;
};
