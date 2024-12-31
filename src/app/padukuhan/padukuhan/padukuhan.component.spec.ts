import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PadukuhanComponent } from './padukuhan.component';

describe('PadukuhanComponent', () => {
  let component: PadukuhanComponent;
  let fixture: ComponentFixture<PadukuhanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PadukuhanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PadukuhanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
