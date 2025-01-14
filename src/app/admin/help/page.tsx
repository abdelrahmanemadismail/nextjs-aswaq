'use client'

import { useEffect, useState } from 'react'
import { FAQCategory, FAQArticle } from '@/types/help'
import {
  getFAQCategories,
  getFAQArticles,
  createFAQCategory,
  updateFAQCategory,
  deleteFAQCategory,
  createFAQArticle,
  updateFAQArticle,
  deleteFAQArticle,
} from '@/actions/help-actions'
import { toast } from '@/hooks/use-toast'
import FAQAdmin from '@/components/help/FAQAdmin'

export default function HelpCenterPage() {
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [articles, setArticles] = useState<FAQArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [categoriesData, articlesData] = await Promise.all([
        getFAQCategories(),
        getFAQArticles(),
      ])
      setCategories(categoriesData)
      setArticles(articlesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load help center data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (category: Partial<FAQCategory>) => {
    await createFAQCategory(category)
    await loadData()
  }

  const handleUpdateCategory = async (id: string, category: Partial<FAQCategory>) => {
    await updateFAQCategory(id, category)
    await loadData()
  }

  const handleDeleteCategory = async (id: string) => {
    await deleteFAQCategory(id)
    await loadData()
  }

  const handleCreateArticle = async (article: Partial<FAQArticle>) => {
    await createFAQArticle(article)
    await loadData()
  }

  const handleUpdateArticle = async (id: string, article: Partial<FAQArticle>) => {
    await updateFAQArticle(id, article)
    await loadData()
  }

  const handleDeleteArticle = async (id: string) => {
    await deleteFAQArticle(id)
    await loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <FAQAdmin
      categories={categories}
      articles={articles}
      onCreateCategory={handleCreateCategory}
      onUpdateCategory={handleUpdateCategory}
      onDeleteCategory={handleDeleteCategory}
      onCreateArticle={handleCreateArticle}
      onUpdateArticle={handleUpdateArticle}
      onDeleteArticle={handleDeleteArticle}
    />
  )
}