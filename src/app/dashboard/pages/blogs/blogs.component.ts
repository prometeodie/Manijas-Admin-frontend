import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BlogsService } from '../../services/blogs.service';
import { Blog, CardTemplate } from '../../interfaces';
import { map } from 'rxjs';
import { BlogsCategories } from '../../interfaces/blogs interfaces/blog-categories.enum';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent implements OnInit{
  readonly blogsPath = '/lmdr/create-edit/BLOGS';
  private blogsService = inject(BlogsService);
  public blogs: CardTemplate[] = [];
  public page = 1;
  public currentCategory: BlogsCategories | null = BlogsCategories.ALL;
  public isLoading: boolean = false;
  public isScrolling: boolean = false;
  public categories:BlogsCategories[] = [
    BlogsCategories.ALL,
    BlogsCategories.BOARDGAMES,
    BlogsCategories.ROL,
    BlogsCategories.COCINA,
    BlogsCategories.CRAFTING,
    BlogsCategories.EVENTOS,
    BlogsCategories.LMDR,
    BlogsCategories.MIEMBROS,
    BlogsCategories.OTROS
  ]

  ngOnInit(): void {
    this.actualizeBlogs(BlogsCategories.ALL, this.page);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight && !this.isLoading) {
      this.isScrolling = true;
      this.actualizeBlogs(this.currentCategory, this.page);
    }
  }

  onCategorySelected(category: string | null) {
    this.page = 1;
    this.blogs = [];
    this.currentCategory = category as BlogsCategories;
    if(category === BlogsCategories.ALL){{
      category = null
    }}
    this.actualizeBlogs(this.currentCategory, this.page);
  }

  actualizeBlogs(category?: BlogsCategories | null, page: number = 1){
      this.isLoading = true;
        this.blogsService.getAllBlogs(category , page ).pipe(
          map(blog=> blog!.map(blog=>this.transformData(blog)))
      ).subscribe(
        newBlogs=>{
          if(newBlogs){
            this.blogs = [...this.blogs, ...newBlogs]
            this.page+=1;
          }
          this.isLoading = false;
          this.isScrolling = false;
        }
      ),
      (error:any) => {
        console.error('Error loading blogs:', error);
        this.isLoading = false;
        this.isScrolling = false;
      }
  }

  onCardDelete(){
    this.blogs = [];
    for(let i = 1; i !== this.page; i++){
      this.actualizeBlogs(this.currentCategory, i);
    }
}

  private transformData(blog: Blog): CardTemplate {
    const {
      _id,
      title,
      writedBy,
      blogContent,
      category,
      publish,
      imgName,
      section,
      ...rest
    } = blog;

    return {
      _id: _id!,
      title,
      text:blogContent,
      imgName,
      imgPath:imgName,
      isInfoAList: false,
      section,
      publish,
      ...rest
    };
  }
}
