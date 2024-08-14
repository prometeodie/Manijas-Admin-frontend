import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icons } from '../../interfaces/icons.interface';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {

  private dashboardService = inject(DashboardService);

  readonly standarRoute: string = '/lmdr'
  public icons: Icons[] =[
    {name:'boardgames', icon:'fa-solid fa-chess-king', route:`${this.standarRoute}/boardgames`},
    {name:'eventos', icon:'fa-solid fa-calendar-day', route:`${this.standarRoute}/events`},
    {name:'blogs', icon:'fa-solid fa-newspaper', route:`${this.standarRoute}/blogs`},
    {name:'nosotros', icon:'fa-solid fa-people-group', route:`${this.standarRoute}/us`},
    {name:'panel de control', icon:'fa-solid fa-gears', route:`${this.standarRoute}/control-panel`}
  ];

  saveCurrentUrl(route: string) {
    localStorage.setItem('lastUrl', route);
  }

}
