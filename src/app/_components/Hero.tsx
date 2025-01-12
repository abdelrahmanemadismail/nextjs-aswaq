import React from 'react';
import SearchInput from '@/components/SearchInput';
import Image from 'next/image';
const categories = [
    { name: 'Home Services', icon: '🔧', image: '/400.svg' },
    { name: 'Real Estate', icon: '🏢', image: '/400.svg' },
    { name: 'Vehicles', icon: '🚗', image: '/400.svg' },
    { name: 'Photography', icon: '📸', image: '/400.svg' },
    { name: 'Pets', icon: '🐾', image: '/400.svg' },
    { name: 'Electronics', icon: '📱', image: '/400.svg' },
    { name: 'Furniture', icon: '🪑', image: '/400.svg' },
    { name: 'Food', icon: '🍔', image: '/400.svg' },
];

const HeroSection = () => {
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

                <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-8">
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-2 cursor-pointer group"
                        >
                            <div className="relative w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-white shadow-lg overflow-hidden group-hover:shadow-xl transition-all duration-300">
                                <div className="absolute inset-0 bg-white rounded-full shadow-inner"></div>
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    width={50}
                                    height={50}
                                    className="absolute inset-0 w-full h-full object-cover rounded-full p-2"
                                    loading="eager"
                                    priority
                                />
                            </div>
                            {/* <span className="text-xs md:text-sm text-muted-foreground font-medium">{category.name}</span> */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroSection;