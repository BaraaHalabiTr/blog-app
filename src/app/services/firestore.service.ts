import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc, docData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Post } from '../models/post';
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

  addPost(post: Post): Promise<any> {
    const docRef = doc(collection(this.firestore, 'posts'));
    post.id = docRef.id;
    return setDoc(docRef, post);
  }

  // getPosts(): Observable<any> {
    
  // }
}
