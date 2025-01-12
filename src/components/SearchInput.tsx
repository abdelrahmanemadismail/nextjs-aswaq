"use client";

import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchInputProps {
  /** Additional class names to apply to the form container */
  className?: string;
  /** Default search value */
  defaultValue?: string;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Size variant for the search input */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show loading state */
  isLoading?: boolean;
  /** Whether to disable the input */
  disabled?: boolean;
}

const SearchInput = ({
  className = '',
  defaultValue = '',
  placeholder = 'Search...',
  size = 'md',
  isLoading = false,
  disabled = false,
}: SearchInputProps) => {
  const [searchValue, setSearchValue] = useState(defaultValue);

  // Size mappings for different variants
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  const sizeBox = {
    sm: 'w-8',
    md: 'w-10',
    lg: 'w-12'
  }

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // You can implement your search logic here
    // For example, using router.push or making an API call
    console.log('Searching for:', searchValue);
  }, [searchValue]);

  return (
    <form
      className={`w-full max-w-4xl mx-auto ${className}`}
      onSubmit={handleSubmit}
    >
      <div className="relative flex w-full">
        <Input
          type="search"
          value={searchValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={`
            pr-20
            bg-background
            ${sizeClasses[size]}
            focus-visible:ring-2
            focus-visible:ring-offset-2
            transition-colors
            duration-200
          `}
        />


        {/* Search button */}
        <Button
          type="submit"
          size="icon"
          disabled={disabled || isLoading}
          className={`
            absolute
            right-0
            rounded-l-none
            ${sizeClasses[size]}
            ${sizeBox[size]}
            ${isLoading ? 'opacity-80' : ''}
          `}
        >
          <Search className={`${sizeClasses[size]} ${sizeBox[size]} ${isLoading ? 'animate-pulse' : ''}`} />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </form>
  );
};

export default SearchInput;