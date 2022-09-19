import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of, switchMap } from 'rxjs';
import { User } from '../models/user';
import { FirestoreService } from './firestore.service';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$: Observable<any>;

  constructor(public auth: AngularFireAuth, private firestore: FirestoreService) {
    this.user$ = auth.authState.pipe(
      switchMap(user => {
        return user ? this.firestore.getUser(user.uid) : of(null);
      })
    );
  }

  signInWithGoogle(): Promise<any> {
    return this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(res => {
      this.saveUserData(res.user);
    });
  }

  signout(): Promise<any> {
    return this.auth.signOut();
  }

  getMessage(code: string): string {
    switch(code) {
      case 'auth/user-not-found':
        return 'User not found!'
      case 'auth/wrong-password':
        return 'Incorrect password!';
      case 'auth/email-already-in-use':
        return 'Email already in use!';
      default:
        return code;
    }
  }

  saveUserData(user: any): Promise<any> {
    //creating user object
    const result: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }

    return this.firestore.setUser(result);
  }
}
