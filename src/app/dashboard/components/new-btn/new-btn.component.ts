import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'new-btn',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './new-btn.component.html',
  styleUrls: ['./new-btn.component.scss']
})
export class NewBtnComponent {
  @Input() path!:string;
}
