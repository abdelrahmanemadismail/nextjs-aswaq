import React from 'react';
import {
  Building2,
  TabletSmartphone,
  Headset,
  Shirt,
  Sofa,
  Hammer,
  Gamepad2,
  Dog,
  Baby,
} from "lucide-react";
import { Vehicles, Hobbies, Appliances } from '@/components/Icons';
const CategoryBar = () => {
  const categories = [
    {
      icon: Vehicles,
      name: 'Vehicles',
    },
    {
      icon: Building2,
      name: 'Properties',
    },
    {
      icon: TabletSmartphone,
      name: 'Electronics',
    },
    {
      icon: Headset,
      name: 'Jobs',
    },
    {
      icon: Shirt,
      name: 'Fashion',
    },
    {
      icon: Sofa,
      name: 'Furniture',
    },
    {
      icon: Hammer,
      name: 'Tools',
    },
    {
      icon: Appliances,
      name: 'Appliances',
    },
    {
      icon: Gamepad2,
      name: 'Games',
    },
    {
      icon: Dog,
      name: 'Pets',
    },
    {
      icon: Baby,
      name: 'Kids & Babies',
    },
    {
      icon: Hobbies,
      name: 'Sports & Hobbies',
    },
  ];

  return (
    <div className="w-full bg-background border-y border-border">
      <div className="w-full px-4">
        <div className="overflow-x-auto scrollbar-hide py-2">
          <div className="flex justify-start md:justify-center gap-6 md:gap-12 lg:gap-16 min-w-max px-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                >
                  <div className="p-2 rounded-lg group-hover:bg-muted transition-colors">
                    <IconComponent className="w-5 h-5 text-primary group-hover:text-primary/80" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground whitespace-nowrap">
                    {category.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;