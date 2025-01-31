import { Component, inject, OnInit } from '@angular/core';
import { AboutItemOrganizing, CardTemplate } from '../../interfaces';
import { AboutService } from '../../services/about.service';
import { AboutItem } from '../../interfaces/about interface/about.interface';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { map } from 'rxjs';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
   animations: [
      trigger('enterState',[
        state('void',style({
          transform: 'scale(0.98',
          opacity:0
        })),
        transition(':enter',[
          animate('300ms ease-in',style({
            transform: 'scale(1)',
            opacity:1
          }))
        ])
      ])
    ]
})
export class AboutComponent implements OnInit{
  readonly aboutPath = '/lmdr/create-edit/ABOUT';
  private aboutService = inject(AboutService)
  public isLoading: boolean = false;
  public aboutItems: CardTemplate[] = [];
  public isOrganizing: boolean = false;

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

  filteredData(): AboutItemOrganizing[] {
    return this.aboutItems.map(item => {
      return { _id: item._id, text: item.text || "", img: item.imgName };
    });
  }

  userIsOrganizing(){
    this.isOrganizing = !this.isOrganizing;
  }

  userOrganizeComplete(){
      this.actualizeAboutItems();
      this.userIsOrganizing();
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

