import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogsFormComponent } from './blogs-form.component';

describe('BlogsFormComponent', () => {
  let component: BlogsFormComponent;
  let fixture: ComponentFixture<BlogsFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BlogsFormComponent]
    });
    fixture = TestBed.createComponent(BlogsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
