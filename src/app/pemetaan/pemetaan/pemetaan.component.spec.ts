import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PemetaanComponent } from './pemetaan.component';

describe('PemetaanComponent', () => {
  let component: PemetaanComponent;
  let fixture: ComponentFixture<PemetaanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PemetaanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PemetaanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
