import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthStatus, CheckTokenResponse, LoginResponse, User } from '../interfaces';
import {  Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from 'src/assets/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private readonly baseUrl: string = environment.baseUrl;
    private http = inject( HttpClient )
    private _currentUser = signal< User|null>(null);
    private _authStatus = signal<AuthStatus>(AuthStatus.checking);

    public currentUser = computed(( )=> this._currentUser());
    public authStatus = computed(( )=> this._authStatus());

   private setUserAuthentication(user: User, accessToken: string): boolean{
          this._currentUser.set(user);
          this._authStatus.set( AuthStatus.authenticated );
          localStorage.setItem('token', accessToken);
          localStorage.setItem('id', user._id);

          return true;
    }

    login(email: string, password: string): Observable<boolean> {
      const url = `${this.baseUrl}/auth/login`;
      const body = { email, password };

      return this.http.post<LoginResponse>(url, body).pipe(
        map(({ user, token }) => {
          this.setUserAuthentication(user, token);
          return true;
        }),
        catchError(err => {
          console.error('Login failed with error:', err);
          return throwError(() => err);
        })
      );
    }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/check-token`;
    const token = localStorage.getItem('token');

    if (!token) {
      this._authStatus.set(AuthStatus.noAuthenticated);
      return of(false);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<CheckTokenResponse>(url, { headers }).pipe(
      map(({ user, token }) => {
        this.setUserAuthentication(user, token);
        return true;
      }),
      catchError((err) => {
        console.warn('Token inválido o expirado:', err?.error?.message);
        this._authStatus.set(AuthStatus.noAuthenticated);
        return of(false);
      })
    );
  }

  logOutUser(){
    localStorage.clear();
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.noAuthenticated);
  }
}

