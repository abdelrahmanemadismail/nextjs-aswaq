import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchInput from '@/components/SearchInput';
import { getCategories } from '@/actions/category-actions';

// Get categories and filter for display_in_hero
const categories = (await getCategories()).filter(category => category.display_in_hero);

const HeroSection = async () => {
    return (
        <div className="w-full bg-gradient-to-b from-primary/5 via-primary/10 to-background py-16 px-4">
            <div className="max-w-7xl mx-auto text-center container">
                <h1 className="text-4xl font-bold mb-12 text-foreground">
                    Find What You Need Right Now
                </h1>

                <div className="mb-16">
                    <SearchInput
                        className="my-4"
                        size="lg"
                    />
                </div>

                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {categories.map((category, index) => (
                        <Link
                            key={index}
                            href={`/listings?category=${category.slug}`}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="relative w-20 h-20 lg:w-28 lg:h-28 rounded-full bg-white shadow-lg overflow-hidden group-hover:shadow-xl transition-all duration-300">
                                <div className="absolute inset-0 bg-white rounded-full shadow-inner"></div>
                                <Image
                                    src={category.hero_image || '/400.svg'}
                                    alt={category.name}
                                    width={112}
                                    height={112}
                                    className="absolute inset-0 w-full h-full object-contain p-3"
                                    loading="eager"
                                    priority
                                />
                            </div>
                            {/* <span className="text-xs md:text-sm text-muted-foreground font-medium">{category.name}</span> */}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroSection;