import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ListingCard, { ListingCardProps } from '@/components/ListingCard';


interface ListingsSectionProps {
  title: string;
  listings: ListingCardProps[];
  viewMoreLink?: string;
}

const ListingsSection: React.FC<ListingsSectionProps> = ({ 
  title = "Listings",
  listings = [],
  viewMoreLink = `/${title.toLowerCase()}`
}) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-shadcn-title">{title}</h2>
        <Link 
          href={viewMoreLink}
          className="flex items-center text-primary hover:text-primary/80"
        >
          View More
          <ChevronRight className="w-5 h-5 ml-1 text-icon" />
        </Link>
      </div>

      {/* Grid of Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing, index) => (
          <ListingCard
            key={index}
            {...listing}
          />
        ))}
      </div>
    </section>
  );
};

export default ListingsSection;