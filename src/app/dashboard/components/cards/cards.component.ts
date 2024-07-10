import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardTemplate } from '../../interfaces/cards.interface';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule],
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

limitTextLength(text:string, maxLength:number) {
  if (text.length > maxLength) {
      return text.slice(0, maxLength).trimEnd() + '...';
  }
  return text;
}

isBoardVoted(hasVoted: boolean){
  if(hasVoted){
    this.isTheBoardVoted = !this.isTheBoardVoted;
  }
  return;
}

limitPlaceText(place:string){
  if(place.length >= 38){
    return place.slice(0, 37) + '...';
  }
  return place;
}
}
