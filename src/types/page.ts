// types/page.ts
export interface Page {
    id: string;
    title: string;
    slug: string;
    content: string;
    meta_description: string | null;
    meta_keywords: string | null;
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