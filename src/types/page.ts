// types/page.ts
export interface Page {
    id: string;
    title: string;
    title_ar: string;
    slug: string;
    content: string;
    content_ar: string;
    meta_description: string | null;
    meta_description_ar: string | null;
    meta_keywords: string | null;
    meta_keywords_ar: string | null;
    is_published: boolean;
    last_updated_by: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface CreatePageInput {
    title: string;
    slug: string;
    content: string;
    meta_description?: string;
    meta_keywords?: string;
    is_published: boolean;
  }
  
  export interface UpdatePageInput extends Partial<CreatePageInput> {
    id: string;
  }