import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  uploadPercentage: Observable<number | undefined>;
  downloadURL: Observable<string | undefined>;

  constructor(private storage: AngularFireStorage) {
    this.uploadPercentage = of(undefined);
    this.downloadURL = of(undefined);
  }

  upload(file: any) {
    const filePath = `post-images/${file.name}`;
    console.log(filePath);
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    this.uploadPercentage = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => this.downloadURL = fileRef.getDownloadURL())
    ).subscribe();
    return task;
  }

  getDownloadURL(): Promise<string | undefined> {
    return new Promise((res, rej) => {
      try {
        this.downloadURL.subscribe(url => res(url));
      } catch(err) {
        rej(err);
      }
    });
  }
}
