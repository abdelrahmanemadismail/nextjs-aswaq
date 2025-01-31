import { useState, useEffect } from 'react';
import { getCategories } from '@/actions/category-actions';
import { Category } from '@/types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return categories;
}; 