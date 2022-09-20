import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post } from '../models/post';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent  {

  constructor(public auth: AuthService, private router: Router, private dialog: MatDialog) {}

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
}

@Component({
  selector: 'add-post-dialog',
  templateUrl: '../dialogs/add-post-dialog.html'
})
export class AddPostDialog implements OnDestroy {

  postForm: FormGroup;
  userSubscription: Subscription;

  constructor(public dialogRef: MatDialogRef<AddPostDialog>, private formBuilder: FormBuilder, private auth: AuthService, private firestore: FirestoreService) {
    this.postForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      fontColor: ['#000000', [Validators.required]],
      fontSize: [12, [Validators.required, Validators.min(12), Validators.max(24)]]
    });

    this.userSubscription = auth.user$.subscribe();
  }

  addPost() {
    this.userSubscription = this.auth.user$.subscribe(user => {
      const post: Post = {
        id: '',
        uid: user.uid,
        title: this.postForm.value.title,
        content: this.postForm.value.content,
        fontColor: this.postForm.value.fontColor,
        fontSize: this.postForm.value.fontSize
      }
      this.firestore.addPost(post).then(res => {
        this.dialogRef.close('Post added!');
      }).catch(err => {
        this.dialogRef.close('An error occurred :(');
      });
    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
