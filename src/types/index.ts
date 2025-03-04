// types/category.ts

export interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  icon: string | null;
  display_in_header: boolean;
  display_in_hero: boolean;
  display_in_home: boolean;
  hero_image: string | null;
  description: string | null;
  description_ar: string | null;
  display_order: number;
  is_active: boolean;
  parent_id: string | null;
  subcategories?: Category[];
  created_at: string;
  updated_at: string;
}

export interface CategoryPath {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  level: number;
}

export interface CategoryResponse {
  data?: Category | Category[];
  error?: string;
}