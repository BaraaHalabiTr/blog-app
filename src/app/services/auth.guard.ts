import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, take, tap, map } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(next: any, state: any): Observable<boolean> {
    return this.auth.user$.pipe(
      take(1),
      map(user => (!!user)),
      tap(signedIn => {
        if(!signedIn) this.router.navigate(['/login']);
      }) 
    );
  }
}
