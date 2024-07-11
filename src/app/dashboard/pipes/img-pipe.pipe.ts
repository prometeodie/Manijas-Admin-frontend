import { Pipe, PipeTransform } from '@angular/core';
import { CardTemplate } from '../interfaces/cards.interface';

@Pipe({
  name: 'image',
  standalone: true
})
export class ImgPipePipe implements PipeTransform {

  transform(card: CardTemplate):string {

    if(!card.id || !card.imgPath) {
      return 'assets/no-img/meeple.svg';
    }
      return card.imgPath;
  }
}
