import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizeCardsComponent } from './organize-cards.component';

describe('OrganizeCardsComponent', () => {
  let component: OrganizeCardsComponent;
  let fixture: ComponentFixture<OrganizeCardsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrganizeCardsComponent]
    });
    fixture = TestBed.createComponent(OrganizeCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
