import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of, switchMap } from 'rxjs';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$: Observable<any>;

  constructor(public auth: AngularFireAuth, private firestore: Firestore) {
    this.user$ = auth.authState.pipe(
      switchMap(user => {
        return user ? docData(doc(firestore, `users/${user.uid}`)) : of(null);
      })
    );
  }

  signInWithGoogle(): Promise<any> {
    return this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(res => {
      this.addUserData(res.user);
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

  addUserData(user: any): Promise<any> {
    return setDoc(doc(this.firestore, `users/${user.uid}`), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    });
  }
}
