import React from 'react';
import Link from 'next/link';
import { getIcon } from '@/lib/utils';
import { Category } from '@/types';
import { getCategories } from '@/actions/category-actions';
import { headers } from 'next/headers';
import { Locale } from '@/i18n.config';

// Partial type for the minimal properties we need to display
type MinimalCategory = Pick<Category, 'id' | 'name' | 'name_ar' | 'slug' | 'icon' | 'display_in_header'>;

// Hardcoded fallback categories in case of data fetch failure
const FALLBACK_CATEGORIES: MinimalCategory[] = [
  { id: '1', name: 'Vehicles', name_ar: 'مركبات', slug: 'vehicles', icon: 'Vehicles', display_in_header: true },
  { id: '2', name: 'Properties', name_ar: 'عقارات', slug: 'properties', icon: 'building-2', display_in_header: true },
  { id: '3', name: 'Electronics', name_ar: 'إلكترونيات', slug: 'electronics', icon: 'tablet-smartphone', display_in_header: true },
  { id: '4', name: 'Furniture', name_ar: 'أثاث', slug: 'furniture', icon: 'Sofa', display_in_header: true },
  { id: '5', name: 'Fashion', name_ar: 'أزياء', slug: 'fashion', icon: 'shirt', display_in_header: true }
];

const CategoryBar = async () => {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  // Fetch categories on the server
  let categories: MinimalCategory[] = FALLBACK_CATEGORIES;
  
  try {
    const fetchedCategories = await getCategories();
    
    // Filter categories for header display
    const headerCategories = fetchedCategories
      .filter(cat => cat.display_in_header)
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        name_ar: cat.name_ar,
        slug: cat.slug,
        icon: cat.icon,
        display_in_header: cat.display_in_header
      }));
      console.log(headerCategories)
      console.log(locale)
      
    if (headerCategories.length > 0) {
      categories = headerCategories;
    }
  } catch (error) {
    console.error("Failed to load categories:", error);
    // Use fallback categories defined above
  }

  // Get the localized category name based on the current locale
  const getLocalizedName = (category: MinimalCategory) => {
    if (locale === 'ar' && category.name_ar) {
      return category.name_ar;
    }
    return category.name;
  };

  return (
    <div className="w-full bg-background border-y border-border">
      <div className="w-full px-4">
        <div className="overflow-x-auto scrollbar-hide py-2">
          <div className="flex justify-start md:justify-center gap-6 md:gap-12 lg:gap-16 min-w-max px-6">
            {categories.map((category) => {
              const IconComponent = getIcon(category.icon);
              return (
                <Link
                  key={category.id || category.slug}
                  href={`/${locale}/listings?category=${category.slug}`}
                  className="flex flex-col items-center flex-shrink-0 group"
                >
                  <div className="p-2 rounded-lg group-hover:bg-muted transition-colors">
                    {IconComponent && <IconComponent className="w-5 h-5 text-primary group-hover:text-primary/80" />}
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground whitespace-nowrap">
                    {getLocalizedName(category)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;