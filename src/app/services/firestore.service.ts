import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) { }

  getUser(id: string): Observable<any> {
    return docData(doc(this.firestore, `users/${id}`));
  }

  setUser(user: User): Promise<any> {
    return setDoc(doc(this.firestore, `users/${user.uid}`), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    });
  }
}
