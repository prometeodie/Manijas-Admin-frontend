import { inject, Injectable } from '@angular/core';
import { environment } from 'src/assets/environments/environment';
import { DashboardService } from './dashboard.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Boardgame, CategoryGame } from '../interfaces';
import { catchError, of } from 'rxjs';
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

  // getBoard(id:string){
  //   const headers = this.dashboardService.getHeaders();

  //   return this.http.get<Blog>(`${this.url}/${id}`, { headers}).pipe(
  //     catchError((err)=>{return of(undefined)})
  //   )
  // }

  // postNewBoard(newBlog: Blog){
  //   const headers = this.dashboardService.getHeaders();
  //   return this.http.post<Blog>(`${this.url}/upload`, newBlog, { headers}).pipe(
  //     catchError((err)=>{return of(undefined)})
  //   )
  // }

  // postBoardImage(id:string, formData: FormData){
  //   const headers = this.dashboardService.getHeaders();
  //   return this.http.post<Blog>(`${this.url}/uploadImg/${id}`, formData, { headers}).pipe(
  //     catchError((err)=>{return of(undefined)})
  //   )
  // }

  // editBoard( id: string, editedEvent: EditBlog){
  //   const headers = this.dashboardService.getHeaders();
  //   return this.http.patch<EditBlog>(`${this.url}/edit/${id}`, editedEvent, { headers}).pipe(
  //     catchError((err)=>{return of(undefined)})
  //   )
  // }
}
