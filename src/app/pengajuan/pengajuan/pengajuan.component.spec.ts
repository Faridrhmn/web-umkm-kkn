import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PengajuanComponent } from './pengajuan.component';

describe('PengajuanComponent', () => {
  let component: PengajuanComponent;
  let fixture: ComponentFixture<PengajuanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PengajuanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PengajuanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
