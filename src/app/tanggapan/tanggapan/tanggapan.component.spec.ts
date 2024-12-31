import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TanggapanComponent } from './tanggapan.component';

describe('TanggapanComponent', () => {
  let component: TanggapanComponent;
  let fixture: ComponentFixture<TanggapanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TanggapanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TanggapanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
