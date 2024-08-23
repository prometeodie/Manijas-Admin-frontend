import { Component, inject, OnInit } from '@angular/core';
import { CardTemplate } from '../../interfaces';
import { AboutService } from '../../services/about.service';
import { AboutItem } from '../../interfaces/about interface/about.interface';
import { map } from 'rxjs';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit{
  readonly aboutPath = '/lmdr/create-edit/ABOUT';
  private aboutService = inject(AboutService)
  public isLoading: boolean = false;
  public aboutItems: CardTemplate[] = [];

  ngOnInit(): void {
    this.actualizeAboutItems();
  }

  onCardDelete(){
    this.actualizeAboutItems();
  }

  actualizeAboutItems(){
    this.isLoading = true;
      this.aboutService.getAllAboutItems( ).pipe(
        map(item=> item!.map(item=>this.transformData(item)))
    ).subscribe(
      aboutItems =>{
          this.aboutItems = aboutItems;
      }
    )
    this.isLoading = false;
  }

  private transformData(item: AboutItem): CardTemplate {
    const {
      _id,
      text,
      publish,
      imgName,
      section,
      ...rest
    } = item;

    return {
      _id: _id!,
      imgName,
      text,
      imgPath:imgName,
      section,
      publish,
      ...rest
    };
  }
}

