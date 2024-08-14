import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentsNavBarComponent } from './components-nav-bar.component';

describe('ComponentsNavBarComponent', () => {
  let component: ComponentsNavBarComponent;
  let fixture: ComponentFixture<ComponentsNavBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ComponentsNavBarComponent]
    });
    fixture = TestBed.createComponent(ComponentsNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
