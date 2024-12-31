import { Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface ImageData {
  src: string
}

@Component({
  selector: 'app-image-prev-dialog',
  templateUrl: './image-prev-dialog.component.html',
  styleUrls: ['./image-prev-dialog.component.scss']
})
export class ImagePrevDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ImagePrevDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageData,
    private fb: FormBuilder
  ) {
  }

}
