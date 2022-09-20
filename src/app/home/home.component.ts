import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent  {

  constructor(public auth: AuthService, private router: Router) {}

  signOut():void {
    this.auth.signout().then(res => {
      this.router.navigate(['/login']);
    });
  }

}
