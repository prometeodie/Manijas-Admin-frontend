import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameManijometroComponent } from './game-manijometro.component';

describe('GameManijometroComponent', () => {
  let component: GameManijometroComponent;
  let fixture: ComponentFixture<GameManijometroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameManijometroComponent]
    });
    fixture = TestBed.createComponent(GameManijometroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
