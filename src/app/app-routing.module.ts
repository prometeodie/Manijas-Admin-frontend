import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { isAuthenticatedGuard } from './auth/guards/isAuthenticated.guard';

const routes: Routes = [
  {
    path:'auth',
    loadChildren: () => import('./auth/auth.module').then(m=>m.AuthModule),
  },
  {
    path:'lmdr',
    canActivate: [isAuthenticatedGuard],
    loadChildren: ()=> import('./dashboard/dashboard.module').then(m=>m.DashboardModule)
  },
  {
    path:'**',
    redirectTo:'lmdr'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
