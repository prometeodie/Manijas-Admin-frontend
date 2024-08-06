import { Pipe, PipeTransform } from '@angular/core';
import { CardTemplate } from '../interfaces/cards.interface';
import { EventCardSample } from '../interfaces';

@Pipe({
  name: 'image',
  standalone: true
})
export class ImgPipePipe implements PipeTransform {

  transform(card: CardTemplate):string {

    if(!card._id || !card.imgPath || card.imgPath.length === 0) {
      return 'assets/no-img/meeple.svg';
    }
      return card.imgPath;
  }
}
