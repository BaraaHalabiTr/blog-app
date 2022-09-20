import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(public auth: AuthService, private router: Router) { }

  signInWithGoogle():void {
    this.auth.signInWithGoogle().then(res => {
      this.router.navigate(['/home']);
    });
  }
}
