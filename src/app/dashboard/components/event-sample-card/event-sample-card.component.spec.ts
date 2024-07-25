import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSampleCardComponent } from './event-sample-card.component';

describe('EventSampleCardComponent', () => {
  let component: EventSampleCardComponent;
  let fixture: ComponentFixture<EventSampleCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EventSampleCardComponent]
    });
    fixture = TestBed.createComponent(EventSampleCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
