"use client";

import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { handleSearchFilter } from "@/lib/filter-utils"
import { useRouter, useSearchParams } from "next/navigation"

const MainSearch = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");


    // Handle input change
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    }, []);

    // Handle form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchValue.trim() === '') {
            return;
        }
        const queryString = handleSearchFilter(searchValue, searchParams);
        router.push(`/listings?${queryString}`);
    }, [searchValue, searchParams, router]);

    return (
        <form
            className={`mx-auto mt-8 max-w-2xl`}
            onSubmit={handleSubmit}
        >
            <div className="flex gap-2 p-2 bg-background rounded-lg shadow-lg">
                <Input
                type="search"
                value={searchValue}
                onChange={handleChange} 
                placeholder="What are you looking for?"
                className="h-12 text-lg border-none"
                />
                <Button size="lg" className="h-12 px-8" type="submit">
                    <Search className="h-5 w-5 mr-2" />
                    Search
                </Button>
            </div>
        </form>
    );
};

export default MainSearch;