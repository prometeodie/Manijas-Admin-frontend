import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardTemplate } from '../../interfaces/cards.interface';
import { ImgPipePipe } from '../../pipes/img-pipe.pipe';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, ImgPipePipe],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  @Input() objectTemplate!: CardTemplate;
 public isTheBoardVoted: boolean = false;
 public isEventCategory: boolean = false

 ngOnInit(){
  (this.objectTemplate.category === 'EVENT')? this.isEventCategory = true : this.isEventCategory = false;
 }

isBoardVoted(hasVoted: boolean){
  if(hasVoted){
    this.isTheBoardVoted = !this.isTheBoardVoted;
  }
  return;
}

}
