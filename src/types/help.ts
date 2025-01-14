export interface FAQCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    display_order: number;
    is_active: boolean;
  }
  
  export interface FAQArticle {
    id: string;
    category_id: string;
    title: string;
    slug: string;
    content: string;
    frontmatter: Record<string, unknown>;
    tags: string[];
    view_count: number;
    is_published: boolean;
    display_order: number;
    version: number;
    updated_at: string;
  }
  
  export interface ArticleData {
    title: string
    content: string
    frontmatter: Record<string, unknown>
    category_name: string
    category_slug: string
    updated_at: string
  }
  
  export interface CategoryWithArticles {
    category_name: string;
    category_description: string;
    articles: FAQArticle[];
  }