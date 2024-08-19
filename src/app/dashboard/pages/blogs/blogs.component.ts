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
  readonly blogsPath = '/lmdr/create-edit/EVENTS';
  private blogsService = inject(BlogsService);
  public blogs: CardTemplate[] = [];;
  public page = 1;
  public isLoading: boolean = false;
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
    this.actualizeBlogs(null, this.page);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight && !this.isLoading) {
      this.actualizeBlogs(BlogsCategories.EVENTOS, this.page);
    }
  }

  onCategorySelected(category: BlogsCategories | null) {
    this.page = 1;
    this.blogs = [];
    if(category === 'ALL'){{
      category = null
    }}
    this.actualizeBlogs(category, this.page);
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
      }
    )
    this.isLoading = false;
  }

  filterBlogByCtegory(category?: BlogsCategories | null){
    this.actualizeBlogs(category, this.page);
  }

  onCardDelete(){
    this.actualizeBlogs();
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
