"use client";

import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { handleSearchFilter } from "@/lib/filter-utils"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "@/hooks/use-translation";

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
  placeholder,
  size = 'md',
  isLoading = false,
  disabled = false,
}: SearchInputProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || defaultValue);

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
    if (e.target.value === '') {
      router.push('/listings')
    }
  }, [router]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const queryString = handleSearchFilter(searchValue, searchParams);
    router.push(`/listings?${queryString}`);
  }, [searchValue, searchParams, router]);

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
          placeholder={placeholder || t.common.searchPlaceholder}
          disabled={disabled || isLoading}
          className={`
            pr-12
            bg-background
            text-primary2
            ${sizeClasses[size]}
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
            bg-primary2
            hover:bg-primary2/90
            ${sizeClasses[size]}
            ${sizeBox[size]}
            ${isLoading ? 'opacity-80' : ''}
          `}
        >
          <Search className={`${sizeClasses[size]} ${sizeBox[size]} ${isLoading ? 'animate-pulse' : ''}`} />
          <span className="sr-only">{t.common.search}</span>
        </Button>
      </div>
    </form>
  );
};

export default SearchInput;