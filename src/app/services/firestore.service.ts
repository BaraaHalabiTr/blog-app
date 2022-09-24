import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc, docData, collection, collectionData } from '@angular/fire/firestore';
import { Observable, combineLatest } from 'rxjs';
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

  getUsers(): Observable<any> {
    return collectionData(collection(this.firestore, 'users'));
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

  getPosts(): Observable<any> {
    return combineLatest(
      [collectionData(collection(this.firestore, 'posts')), this.getUsers()],
      (posts: any, users: any) => posts.map((p: any) => ({
          ...p,
          photoURL: users.filter((u: any) => u.uid === p.uid)[0]?.photoURL,
          displayName: users.filter((u: any) => u.uid === p.uid)[0]?.displayName
      }))
    );
  }
}
