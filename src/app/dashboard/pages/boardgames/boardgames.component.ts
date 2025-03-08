import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Boardgame, CardTemplate, CategoryGame } from '../../interfaces';
import { boardsCategories } from './utils/boardgames-categories';
import { BoardgamesService } from '../../services/boardgames.service';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { map } from 'rxjs';


@Component({
  selector: 'app-boardgames',
  templateUrl: './boardgames.component.html',
  styleUrls: ['./boardgames.component.scss'],
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
export class BoardgamesComponent implements OnInit{
  readonly boardsPath: string = '/lmdr/create-edit/BOARDGAMES';
  private boardgamesServices = inject(BoardgamesService);
  public boards: CardTemplate[] = [];
  public isLoading: boolean = false;
  public isScrolling: boolean = false;
  public categories: CategoryGame[] = boardsCategories;
  public currentCategory: CategoryGame = CategoryGame.ALL;
  public page = 1;

  ngOnInit(): void {
    this.actualizeBoards(CategoryGame.ALL, this.page);
  }
  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight && !this.isLoading) {
      this.isScrolling = true;
      this.actualizeBoards(this.currentCategory, this.page);
    }
  }

    onCategorySelected(category: string | null) {
      this.page = 1;
      this.boards = [];
      this.currentCategory = category as CategoryGame;
      if(category === CategoryGame.ALL){{
        category = null
      }}
      this.actualizeBoards(this.currentCategory, this.page);
    }

    onSearch(event: string){
      this.boardgamesServices.findBoardgame(event).pipe(
        map(board=> board!.map(board=>this.transformData(board)))
      ).subscribe(
        filteredBoardGames=>{
          this.boards = filteredBoardGames;
        }
      )
    }

    actualizeBoards(category?: CategoryGame | null, page: number = 1){
      this.isLoading = true;
      this.boardgamesServices.getAllBoards(category , page ).pipe(
        map(board=> board!.map(board=>this.transformData(board)))
    ).subscribe(
      newBoards=>{
        if(newBoards){
          this.boards = [...this.boards, ...newBoards]
          this.page+=1;
        }
        this.isLoading = false;
        this.isScrolling = false;
      }
    ),
    (error:any) => {
      console.error('Error loading boardgames:', error);
      this.isLoading = false;
      this.isScrolling = false;
    }
    }

    onCardDelete(){
      this.boards = [];
      for(let i = 1; i !== this.page; i++){
        this.actualizeBoards(this.currentCategory, i);
      }
  }


  private transformData(boardgame: Boardgame): CardTemplate {
    const {
      _id,
      title,
      gameReview,
      manijometroPosition,
      manijometroPool,
      publish,
      roulette,
      imgName,
      imgNameMobile,
      cardCoverImgName,
      cardCoverImgNameMobile,
      section,
      ...rest
    } = boardgame;

    return {
      _id: _id!,
      title,
      text:gameReview,
      imgName:cardCoverImgName,
      imgMobileName:cardCoverImgNameMobile,
      isInfoAList: false,
      section,
      manijometroPosition,
      manijometroPool,
      roulette,
      publish,
      ...rest
    };
  }
}
