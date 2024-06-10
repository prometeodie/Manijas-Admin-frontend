import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManijometroComponent } from './manijometro.component';

describe('ManijometroComponent', () => {
  let component: ManijometroComponent;
  let fixture: ComponentFixture<ManijometroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManijometroComponent]
    });
    fixture = TestBed.createComponent(ManijometroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
