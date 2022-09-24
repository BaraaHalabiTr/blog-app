import { Component, OnDestroy, Inject, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
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
      width: 'fit',
      maxHeight: '60%',
      disableClose: true
    });

    ref.afterClosed().subscribe(res => {
      console.log(res);
    })
  }

  openPostDialog(post: Post):void {
    this.dialog.open(PostDialog, {
      width: 'fit',
      maxHeight: '60%',
      disableClose: true,
      data: post
    });
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
  image: File | undefined;

  previewURL: string;


  constructor(public dialogRef: MatDialogRef<AddPostDialog>, private formBuilder: FormBuilder, private auth: AuthService, private firestore: FirestoreService, public storage: StorageService) {
    this.postForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      fontColor: ['#000000', [Validators.required]],
      fontSize: [12, [Validators.required, Validators.min(12), Validators.max(24)]],
      // picture: ['', [Validators.required]]
    });

    this.image = undefined;
    this.userSubscription = auth.user$.subscribe();
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
  }

  setImage(event: any) {
    this.image = event.target.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.previewURL = reader.result as string;
    }
    reader.readAsDataURL(event.target.files[0]);

    // let reader = new FileReader();
    // reader.readAsDataURL(event.target.files[0]);
    // reader.onload = (e) => {
    //   this.preview.next(e.target?.result);
    // }
  }
}

@Component({
  selector: 'post-dialog',
  templateUrl: '../dialogs/post-dialog.html'
})
export class PostDialog {

 @ViewChild('content') content: ElementRef;

  constructor(dialogRef: MatDialogRef<PostDialog>, @Inject(MAT_DIALOG_DATA) public data: Post, private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.renderer.setStyle(this.content.nativeElement, 'color', this.data.fontColor);
    this.renderer.setStyle(this.content.nativeElement, 'font-size', this.data.fontSize + 'px');
  }
}
