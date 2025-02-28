"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getIcon } from '@/lib/utils';
import { Category } from '@/types';

// Partial type for the minimal properties we need to display
type MinimalCategory = Pick<Category, 'id' | 'name' | 'slug' | 'icon' | 'display_in_header'>;

// Hardcoded initial categories to show immediately
const FALLBACK_CATEGORIES: MinimalCategory[] = [
  { id: '1', name: 'Vehicles', slug: 'vehicles', icon: 'Vehicles', display_in_header: true },
  { id: '2', name: 'Properties', slug: 'properties', icon: 'building-2', display_in_header: true },
  { id: '3', name: 'Electronics', slug: 'electronics', icon: 'tablet-smartphone', display_in_header: true },
  { id: '4', name: 'Furniture', slug: 'furniture', icon: 'Sofa', display_in_header: true },
  { id: '5', name: 'Fashion', slug: 'fashion', icon: 'shirt', display_in_header: true }
];

const CategoryBar = () => {
  // Use MinimalCategory type since we only need a subset of properties for display
  const [categories, setCategories] = useState<MinimalCategory[]>(FALLBACK_CATEGORIES);
  
  // Fetch real categories in the background
  useEffect(() => {
    let mounted = true;
    
    // Use dynamic import to reduce initial bundle size
    import('@/actions/category-actions').then(({ getCategories }) => {
      getCategories().then(data => {
        // Make sure component is still mounted
        if (mounted) {
          const headerCats = data
            .filter(cat => cat.display_in_header)
            .map(cat => ({
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              icon: cat.icon,
              display_in_header: cat.display_in_header
            }));
            
          if (headerCats.length > 0) {
            setCategories(headerCats);
          }
        }
      }).catch(error => {
        console.error("Failed to load categories:", error);
      });
    });
    
    return () => {
      mounted = false;
    };
  }, []);

  // Render immediately with either fallback or real categories
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
                  href={`/listings?category=${category.slug}`}
                  className="flex flex-col items-center flex-shrink-0 group"
                >
                  <div className="p-2 rounded-lg group-hover:bg-muted transition-colors">
                    {IconComponent && <IconComponent className="w-5 h-5 text-primary group-hover:text-primary/80" />}
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground whitespace-nowrap">
                    {category.name}
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