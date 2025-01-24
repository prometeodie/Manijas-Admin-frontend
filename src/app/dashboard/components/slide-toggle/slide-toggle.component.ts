import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouletteInfo } from '../../interfaces';
import { BoardgamesService } from '../../services/boardgames.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'slide-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.scss']
})
export class SlideToggleComponent implements OnInit {
  @Input() sliderInfo!: RouletteInfo;
  @Output() isToggleRouletteSuccess = new EventEmitter<boolean>();

  @ViewChild('slider') slider!: ElementRef;

  private boardgameService = inject(BoardgamesService)
  private dashboardService = inject(DashboardService)


  ngOnInit(): void {
    this.sliderInfo;
  }

  toggleRoulette(){
    const checkbox = this.slider.nativeElement;
    const {_id} = this.sliderInfo;
    this.boardgameService.toggleRoulette({_id, roulette:checkbox.checked}).subscribe(resp =>{
      if(resp){
        this.dashboardService.notificationPopupRoulette('Modificación exitosa', '#A5D6A7');
      }else{
        this.dashboardService.notificationPopupRoulette('Algo salio mal :C', '#FFCDD2');
        this.slider.nativeElement.checked = !checkbox.checked;
      }
    })
  }

}
