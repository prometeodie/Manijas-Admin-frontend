import { Pipe, PipeTransform } from '@angular/core';
import { CardTemplate } from '../interfaces/card interface/cards.interface';
import { EventCardSample } from '../interfaces';

@Pipe({
  name: 'image',
  standalone: true
})
export class ImgPipePipe implements PipeTransform {

  transform(card: CardTemplate):string {

    if(!card._id || !card.imgName || card.imgName.length === 0) {
      return 'assets/no-img/meeple.svg';
    }
      return card.imgName;
  }
}
