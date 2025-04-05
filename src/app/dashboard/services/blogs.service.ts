import { inject, Injectable } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, of, throwError } from 'rxjs';
import { environment } from 'src/assets/environments/environment';
import { Blog, EditBlog } from '../interfaces';
import { BlogsCategories } from '../interfaces/blogs interfaces/blog-categories.enum';

@Injectable({
  providedIn: 'root'
})
export class BlogsService {

  readonly url = `${environment.baseUrl}/blogs`
  readonly blogsCategories: string[] = [
    BlogsCategories.BOARDGAMES,
    BlogsCategories.ROL,
    BlogsCategories.LMDR,
    BlogsCategories.COCINA,
    BlogsCategories.CRAFTING,
    BlogsCategories.EVENTOS,
    BlogsCategories.MIEMBROS,
    BlogsCategories.OTROS
  ]
  private dashboardService = inject(DashboardService);
  private http = inject(HttpClient);


  // C.R.U.D
  getAllBlogs(category?: BlogsCategories | null, page: number = 1) {
    const headers = this.dashboardService.getHeaders();
    const params = new HttpParams()
      .set('category', category ?? '')
      .set('page', page.toString());

    return this.http.get<Blog[]>(`${this.url}/admin`, { headers, params }).pipe(
      catchError((err) => {
        console.error('Error fetching blogs:', err);
        return of(undefined);
      })
    );
  }

  getBlog(id:string){
    const headers = this.dashboardService.getHeaders();

    return this.http.get<Blog>(`${this.url}/${id}`, { headers}).pipe(
      catchError((err)=>{return throwError(() => err);})
    )
  }

  postNewBlog(newBlog: EditBlog){
    const headers = this.dashboardService.getHeaders();
    return this.http.post<Blog>(`${this.url}/upload`, newBlog, { headers}).pipe(
      catchError((err)=>{return throwError(() => err);})
    )
  }

  postBlogImage(id:string, formData: FormData){
    const headers = this.dashboardService.getHeaders();
    return this.http.post<Blog>(`${this.url}/uploadImg/${id}`, formData, { headers}).pipe(
      catchError((err)=>{return throwError(() => err);})
    )
  }

  editBlog( id: string, editedEvent: EditBlog){
    const headers = this.dashboardService.getHeaders();
    return this.http.patch<EditBlog>(`${this.url}/edit/${id}`, editedEvent, { headers}).pipe(
      catchError((err)=>{return throwError(() => err);})
    )
  }
}
