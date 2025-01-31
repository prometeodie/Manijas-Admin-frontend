import { Component, inject, OnInit } from '@angular/core';
import { ManijometroService } from '../../services/manijometro.service';
import { Manijometro } from '../../interfaces';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Router } from '@angular/router';
import { trigger, style, animate, transition, state } from '@angular/animations';

@Component({
  selector: 'app-manijometro',
  templateUrl: './manijometro.component.html',
  styleUrls: ['./manijometro.component.scss'],
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
export class ManijometroComponent implements OnInit{
  private manijometroService = inject(ManijometroService);
  private authService = inject(AuthService);
  private router = inject(Router);
  public categories: string[] = [
    'ALL',
    ...Array.from({ length: 13 }, (_, i) => String.fromCharCode(65 + i)), // A - M
    'Ñ', // Añadir 'Ñ'
    ...Array.from({ length: 13 }, (_, i) => String.fromCharCode(78 + i)), // N - Z
    ...Array.from({ length: 10 }, (_, i) => String(i)) // 0 - 9
  ];

  public isLoading: boolean = false;
  public allBoardGames:Manijometro[] =[];
  public filteredBoardgames:Manijometro[] =[];
  public boardGamesAlreadyVoted:Manijometro[] =[];
  public boardGamesNotVoted:Manijometro[] =[];
  public userId!:string;
  public votedGames:boolean = false;
  public category:string = 'all';
  ngOnInit(): void {
    this.isLoading = true;
    this.userId = this.authService.currentUser()!._id;
    this.manijometroService.getAllMAnijmetroBoard().subscribe(resp =>{
      if(resp){
        this.allBoardGames = resp;
        this.filterVotedAndUnVotedBg(resp)
        this.filteredBoardgames= this.boardGamesNotVoted;
      }else{
        this.allBoardGames = []
      }
    });
    this.isLoading = false;
  }

  filterVotedAndUnVotedBg(boards: Manijometro[]) {
    boards.forEach(board => {
      if (board.manijometroPool.length === 0) {
        this.boardGamesNotVoted.push(board);
      } else {
        const hasVoted = board.manijometroPool.some(pool => pool.userId === this.userId);
        if (hasVoted) {
          this.boardGamesAlreadyVoted.push(board);
        } else {
          this.boardGamesNotVoted.push(board);
        }
      }
    });
  }

  filterBoardsByVoteStatus(userNeedsVotedGames:boolean){
    this.votedGames = userNeedsVotedGames;
    if(this.category === 'all'){
      (userNeedsVotedGames)? this.filteredBoardgames = this.boardGamesAlreadyVoted : this.filteredBoardgames = this.boardGamesNotVoted;
    }else{
      this.onCategorySelected(this.category);
    }
  }

  onCategorySelected(category: string | null) {
    let boardgames = [];
    this.category = category!;
    if(category?.toLowerCase() === 'all' && this.votedGames){
      this.filteredBoardgames = this.boardGamesAlreadyVoted;
      return;
    }
    if(category?.toLowerCase() === 'all' && !this.votedGames){
      this.filteredBoardgames = this.boardGamesNotVoted;
      return;
    }

    (this.votedGames)? boardgames = this.boardGamesAlreadyVoted :boardgames = this.boardGamesNotVoted;

      this.filteredBoardgames = boardgames.filter(board =>{
        return board.title[0].toLowerCase() === category?.toLowerCase();
      })
  }

  voteBoardGame(gameId: string){
    this.router.navigateByUrl(`lmdr/manijometro/${gameId}`);
  }
}

