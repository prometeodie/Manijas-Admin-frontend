import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsaveComponent } from './unsave.component';

describe('UnsaveComponent', () => {
  let component: UnsaveComponent;
  let fixture: ComponentFixture<UnsaveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UnsaveComponent]
    });
    fixture = TestBed.createComponent(UnsaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
