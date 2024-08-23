import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogsCategories } from '../../interfaces/blogs interfaces/blog-categories.enum';

@Component({
  selector: 'components-nav-bar',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './components-nav-bar.component.html',
  styleUrls: ['./components-nav-bar.component.scss']
})
export class ComponentsNavBarComponent {
  @Input() categories!: string[];
  @Output() category = new EventEmitter<string>();

  emitCategory(category: string){
    this.category.emit(category);
  }
}
