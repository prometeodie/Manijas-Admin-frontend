import { Pipe, PipeTransform } from '@angular/core';
import { CardTemplate } from '../interfaces/card interface/cards.interface';
import { EventCardSample, SignedImgUrl } from '../interfaces';

@Pipe({
  name: 'image',
  standalone: true
})
export class ImgPipePipe implements PipeTransform {

  transform(src: string | SignedImgUrl):string {

      if(!src) {
      return 'assets/no-img/meeple.svg';
    }
      return src.toString();
  }
}
