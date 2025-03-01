export interface Category {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  icon: string | null;
  display_in_header: boolean;
  display_in_hero: boolean;
  display_in_home: boolean;
  hero_image: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  parent_id: string | null;
  subcategories?: Category[];
  created_at: string;
  updated_at: string;
} 