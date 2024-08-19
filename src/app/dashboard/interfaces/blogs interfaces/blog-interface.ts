import { BlogsCategories } from "./blog-categories.enum";

export interface Blog {
  _id:         string;
  title:       string;
  subTitle:    string;
  writedBy:    string;
  blogContent: string;
  category:    BlogsCategories[];
  section:     string;
  imgName:     string;
  publish:     boolean;
}
