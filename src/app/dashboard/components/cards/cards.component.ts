import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardTemplate } from '../../interfaces/cards.interface';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent {
 public isTheBoardVoted:boolean = false;

 public objectTemplate: CardTemplate = {
  id:'asdasdd',
  title:' Luna Capital',
  imgPath:'../../../../assets/images.jpeg',
  isInfoAList:false,
  info:['lalalalalalaljasdnjhabs asuhdbaiusdh aiuyd aiusdygiaud giusd'],
  category:'BOARDGAME',
  publish: false,
  manijometro:99,
  hasVoted:true,

 }

limitTextLength(text:string, maxLength:number) {
  if (text.length > maxLength) {
      return text.slice(0, maxLength).trimEnd() + '...';
  }
  return text;
}

isBoardVoted(){
  this.isTheBoardVoted = !this.isTheBoardVoted;
}
}
