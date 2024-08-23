import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardgamesFormComponent } from './boardgames-form.component';

describe('BoardgamesFormComponent', () => {
  let component: BoardgamesFormComponent;
  let fixture: ComponentFixture<BoardgamesFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BoardgamesFormComponent]
    });
    fixture = TestBed.createComponent(BoardgamesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
