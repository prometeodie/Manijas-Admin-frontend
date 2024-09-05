import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'new-btn',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './new-btn.component.html',
  styleUrls: ['./new-btn.component.scss']
})
export class NewBtnComponent {
  @Input() path!:string;
  private dashboardService = inject(DashboardService);

  saveCurrentUrl(route: string) {
   this.dashboardService.saveCurrentUrl(route);
  }
}
