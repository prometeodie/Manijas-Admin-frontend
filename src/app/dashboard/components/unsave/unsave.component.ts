import { Component, HostListener, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'unsave',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unsave.component.html',
  styleUrls: ['./unsave.component.scss']
})
export class UnsaveComponent implements OnChanges{
  private dashboardService = inject(DashboardService);
  @Input() hasUnsavedChanges!:boolean;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hasUnsavedChanges'] && !changes['hasUnsavedChanges'].isFirstChange()) {
      const newValue = changes['hasUnsavedChanges'].currentValue;
      this.dashboardService.setHasBeenChanged(this.hasUnsavedChanges);
    }
  }

}
