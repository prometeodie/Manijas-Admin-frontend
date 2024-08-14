import { Component } from '@angular/core';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent {
readonly blogsPath = '/lmdr/create-edit/EVENTS';
public selectedCategory: string = 'all';
public categories:string[] = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho']

onCategorySelected(category: string) {
  this.selectedCategory = category;
}

}
