import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagePrevDialogComponent } from './image-prev-dialog.component';

describe('ImagePrevDialogComponent', () => {
  let component: ImagePrevDialogComponent;
  let fixture: ComponentFixture<ImagePrevDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImagePrevDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagePrevDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
