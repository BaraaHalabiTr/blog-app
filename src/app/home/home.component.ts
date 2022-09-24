import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FirebaseStorage, uploadBytesResumable } from 'firebase/storage';
import { Observable, Subscription, of } from 'rxjs';
import { Post } from '../models/post';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { REFERENCE_PREFIX } from '@angular/compiler/src/render3/view/util';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent  {

  posts$: Observable<any>;
  
  constructor(public auth: AuthService, private router: Router, private dialog: MatDialog, private firestore: FirestoreService) {
    this.posts$ = this.firestore.getPosts();
  }

  openAddDialog():void {
    const ref = this.dialog.open(AddPostDialog, {
      minWidth: '500px',
      disableClose: true
    });

    ref.afterClosed().subscribe(res => {
      console.log(res);
    })
  }

  signOut():void {
    this.auth.signout().then(res => {
      this.router.navigate(['/login']);
    });
  }

  // upload() {
  //   const metadata = {
  //     contentType: 'image/jpeg'
  //   };
  //   // this.storages
  //   // const storageRef = ref(this.storage, 'images/' + file.name);
  //   // const uploadTask = this.storage.uploadBytesResumable(storageRef, file, metadata);
  // }
}

@Component({
  selector: 'add-post-dialog',
  templateUrl: '../dialogs/add-post-dialog.html'
})
export class AddPostDialog implements OnDestroy {

  postForm: FormGroup;
  userSubscription: Subscription;
  urlSubscription: Subscription | undefined;
  image: File | undefined;

  constructor(public dialogRef: MatDialogRef<AddPostDialog>, private formBuilder: FormBuilder, private auth: AuthService, private firestore: FirestoreService, public storage: StorageService) {
    this.postForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      fontColor: ['#000000', [Validators.required]],
      fontSize: [12, [Validators.required, Validators.min(12), Validators.max(24)]],
      picture: ['', [Validators.required]]
    });

    this.image = undefined;
    this.userSubscription = auth.user$.subscribe();
    this.urlSubscription = undefined;
  }

  addPost() {
    if(!this.postForm.valid || !this.image) return;
    this.userSubscription = this.auth.user$.subscribe(user => {
      const post: Post = {
        id: '',
        uid: user.uid,
        title: this.postForm.value.title,
        content: this.postForm.value.content,
        fontColor: this.postForm.value.fontColor,
        fontSize: this.postForm.value.fontSize,
        imageURL: ''
      }
      this.storage.upload(this.image).then(() => {
        return this.storage.getDownloadURL();
      }).then(url => {
        post.imageURL = url;
        return this.firestore.addPost(post);
      }).then(() => {
        this.dialogRef.close('Post added!');
      }).catch(() => {
        this.dialogRef.close('An error occurred :(');
      });
    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    if(this.urlSubscription)
      this.urlSubscription.unsubscribe();
  }

  setImage(event: any) {
    this.image = event.target.files[0];
  }
}
