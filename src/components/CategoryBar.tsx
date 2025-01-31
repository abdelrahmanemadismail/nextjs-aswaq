import React from 'react';
import Link from 'next/link';

import { getCategories } from '@/actions/category-actions';
import { getIcon } from '@/lib/utils';

const CategoryBar = async () => {
  // Get categories and filter for display_in_header
  const categories = (await getCategories()).filter(category => category.display_in_header);

  return (
    <div className="w-full bg-background border-y border-border">
      <div className="w-full px-4">
        <div className="overflow-x-auto scrollbar-hide py-2">
          <div className="flex justify-start md:justify-center gap-6 md:gap-12 lg:gap-16 min-w-max px-6">
            {categories.map((category, index) => {
              const IconComponent = getIcon(category.icon);
              return (
                <Link
                  key={index}
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