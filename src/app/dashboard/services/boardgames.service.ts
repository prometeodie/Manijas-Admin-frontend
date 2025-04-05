import { inject, Injectable } from '@angular/core';
import { environment } from 'src/assets/environments/environment';
import { DashboardService } from './dashboard.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Boardgame, BoardgameUpload, CategoryGame, RouletteInfo } from '../interfaces';
import { catchError, of, throwError } from 'rxjs';
import { Dificulty } from '../interfaces/boards interfaces/dificulty.enum';
import { Replayability } from '../interfaces/boards interfaces/replayability.enum';

@Injectable({
  providedIn: 'root'
})
export class BoardgamesService {

  readonly url = `${environment.baseUrl}/boardgames`
  readonly boardsCategories: string[] = [
    CategoryGame.EUROGAMES,
    CategoryGame.AMERITRASH,
    CategoryGame.PARTY,
    CategoryGame.AREA,
    CategoryGame.COOPERATIVE,
    CategoryGame.DECKBUILDING,
    CategoryGame.DESTREZA,
    CategoryGame.ECONOMICSIMULATION,
    CategoryGame.EDUCATIVO,
    CategoryGame.WORKERPLACEMENT,
    CategoryGame.ENGINEBUILDING,
    CategoryGame.ENGAÑO,
    CategoryGame.ABSTRACTO,
    CategoryGame.FILLER,
    CategoryGame.LEGACY,
    CategoryGame.LOSETA,
    CategoryGame.NARRACION,
    CategoryGame.ROL,
    CategoryGame.SOCIAL,
    CategoryGame.TEMATICO,
    CategoryGame.WARGAMES
  ]
  readonly dificulty:string[] =[
    Dificulty.LOW,
    Dificulty.MEDIUM,
    Dificulty.HIGH
  ]

  readonly replayability:string[] =[
    Replayability.LOW,
    Replayability.MEDIUM,
    Replayability.HIGH
  ]
  private dashboardService = inject(DashboardService);
  private http = inject(HttpClient);

  imgPathCreator(boardGame: Boardgame, screenSize: number, cardCover: boolean) {

    if (!boardGame) return [];

    if (cardCover && !boardGame.cardCoverImgName) {
      return [];
    }

    if (!cardCover && boardGame.imgName.length === 0) {
      return [];
    }

    if (screenSize < 800) {
      return cardCover
        ? [`upload/${boardGame.section}/${boardGame._id}/optimize/${boardGame.cardCoverImgName}`]
        : boardGame.imgName.map(
            boardImg => `upload/${boardGame.section}/${boardGame._id}/optimize/${boardImg}`
          );
    } else {
      return cardCover
        ? [`upload/${boardGame.section}/${boardGame._id}/${boardGame.cardCoverImgName}`]
        : boardGame.imgName.map(
            boardImg => `upload/${boardGame.section}/${boardGame._id}/${boardImg}`
          );
    }
  }


  // C.R.U.D
  getAllBoards(category?: CategoryGame | null, page: number = 1) {
    const headers = this.dashboardService.getHeaders();

    const params = new HttpParams()
      .set('category', category ?? '')
      .set('page', page.toString());

    return this.http.get<Boardgame[]>(`${this.url}/admin`, { headers, params }).pipe(
      catchError((err) => {
        console.error('Error fetching blogs:', err);
        return of(undefined);
      })
    );
  }

  findBoardgame(query:string){
    const headers = this.dashboardService.getHeaders();
    const params = new HttpParams().set('title', query);

    return this.http.get<Boardgame[]>(`${this.url}/findboardgame/admin`, { headers, params });
  }

  getBoard(id:string){
    const headers = this.dashboardService.getHeaders();

    return this.http.get<Boardgame>(`${this.url}/${id}`, { headers}).pipe(
      catchError((err)=>{return throwError(() => err);})
    )
  }

  postNewBoardG(newBoardGame: BoardgameUpload){
    const headers = this.dashboardService.getHeaders();
    return this.http.post<Boardgame>(`${this.url}/upload`, newBoardGame, { headers}).pipe(
      catchError((err)=>{return throwError(() => err);})
    )
  }

  editBoard( id: string, editedEvent: BoardgameUpload){
    const headers = this.dashboardService.getHeaders();
    return this.http.patch<BoardgameUpload>(`${this.url}/edit/${id}`, editedEvent, { headers}).pipe(
      catchError((err)=>{return throwError(() => err);})
    )
  }

  toggleRoulette(rouletteInfo:RouletteInfo){
    const headers = this.dashboardService.getHeaders();

    return this.http.patch<BoardgameUpload>(`${this.url}/togglee-roulette`, rouletteInfo, { headers}).pipe(
      catchError((err)=>{return throwError(() => err);})
    )
  }
}
