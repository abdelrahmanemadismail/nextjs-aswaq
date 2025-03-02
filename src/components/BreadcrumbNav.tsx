"use client";
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from 'next/navigation';
import { HomeIcon } from "lucide-react"
import { useTranslation } from '@/hooks/use-translation';
import { Languages } from '@/constants/enums';

const BreadcrumbNav = () => {
  const pathname = usePathname();
  const { t, locale, getLocalizedPath } = useTranslation();

  // Function to generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    // Remove trailing slash and split path into segments
    let segments = pathname?.split('/').filter(Boolean) || [];
    
    // Remove the locale segment (ar or en) if present
    if (segments.length > 0 && (segments[0] === Languages.ARABIC || segments[0] === Languages.ENGLISH)) {
      segments = segments.slice(1);
    }

    // Skip if no segments left
    if (segments.length === 0) return [];

    // Transform segments into readable format
    return segments.map(segment => {
      // Build the path for this segment
      const segmentIndex = segments.indexOf(segment);
      const path = `/${segments.slice(0, segmentIndex + 1).join('/')}`;
      const localizedPath = getLocalizedPath(path);
      
      // Format the label
      const label = segment.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      return {
        href: localizedPath,
        label
      };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={getLocalizedPath('/')} className="flex items-center gap-2">
            <HomeIcon className="h-4 w-4" />
            {t.common.home || "Home"}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className={locale === Languages.ARABIC ? "rotate-180" : ""} />
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.href}>
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={breadcrumb.href}>
                  {breadcrumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className={locale === Languages.ARABIC ? "rotate-180" : ""} />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbNav;