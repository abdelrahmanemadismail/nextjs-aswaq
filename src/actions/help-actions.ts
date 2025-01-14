"use server"
import { createClient } from '@/utils/supabase/server'
import { CategoryWithArticles, FAQCategory, FAQArticle, ArticleData } from '@/types/help'

export async function getFaqCategories(): Promise<FAQCategory[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('faq_categories')
    .select('*')
    .order('display_order', { ascending: true })
    
  if (error) throw error
  return data
}

export async function getFaqsByCategory(slug: string): Promise<CategoryWithArticles> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('get_faqs_by_category', { category_slug: slug })
    .single()
    
  if (error) throw error
  return data as CategoryWithArticles
}

export async function getFaqArticle(slug: string): Promise<ArticleData> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('get_faq_article', { article_slug: slug })
    .single()
    
  if (error) throw error
  return data as ArticleData
}

export async function searchFaqs(query: string): Promise<FAQArticle[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('faq_articles')
    .select(`
      *,
      category:faq_categories(name)
    `)
    .textSearch('title', query)
    .or(`content.ilike.%${query}%`)
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    
  if (error) throw error
  return data
}

// Categories
export async function getFAQCategories(): Promise<FAQCategory[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('faq_categories')
      .select('*')
      .order('display_order')
  
    if (error) throw error
    return data
  }
  
  export async function createFAQCategory(category: Partial<FAQCategory>) {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('faq_categories')
      .insert([category])
  
    if (error) throw error
  }
  
  export async function updateFAQCategory(id: string, category: Partial<FAQCategory>) {
    const supabase = await createClient()
    
    // Check if the slug is unique (excluding the current category)
    if (category.slug) {
      const { data: existingCategory } = await supabase
        .from('faq_categories')
        .select('id')
        .eq('slug', category.slug)
        .neq('id', id)
        .single()
  
      if (existingCategory) {
        throw new Error('A category with this slug already exists')
      }
    }
  
    const { error } = await supabase
      .from('faq_categories')
      .update(category)
      .eq('id', id)
  
    if (error) {
      console.error('Error updating category:', error)
      throw new Error('Failed to update category')
    }
  }
  
  export async function deleteFAQCategory(id: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('faq_categories')
      .delete()
      .eq('id', id)
  
    if (error) throw error
  }
  
  // Articles
  export async function getFAQArticles(): Promise<FAQArticle[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('faq_articles')
      .select('*')
      .order('display_order')
  
    if (error) throw error
    return data
  }
  
  export async function createFAQArticle(article: Partial<FAQArticle>) {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('faq_articles')
      .insert([article])
  
    if (error) throw error
  }
  
  export async function updateFAQArticle(id: string, article: Partial<FAQArticle>) {
    const supabase = await createClient()
    
    // Check if the slug is unique (excluding the current article)
    if (article.slug) {
      const { data: existingArticle } = await supabase
        .from('faq_articles')
        .select('id')
        .eq('slug', article.slug)
        .neq('id', id)
        .single()
  
      if (existingArticle) {
        throw new Error('An article with this slug already exists')
      }
    }
  
    // Verify category exists if category_id is provided
    if (article.category_id) {
      const { data: category } = await supabase
        .from('faq_categories')
        .select('id')
        .eq('id', article.category_id)
        .single()
  
      if (!category) {
        throw new Error('Selected category does not exist')
      }
    }
  
    const { error } = await supabase
      .from('faq_articles')
      .update({
        ...article,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
  
    if (error) {
      console.error('Error updating article:', error)
      throw new Error('Failed to update article')
    }
  }
  
  export async function deleteFAQArticle(id: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('faq_articles')
      .delete()
      .eq('id', id)
  
    if (error) throw error
  }
  
  // Get article by slug
  export async function getFAQArticleBySlug(slug: string): Promise<FAQArticle | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('faq_articles')
      .select('*')
      .eq('slug', slug)
      .single()
  
    if (error) throw error
    return data
  }
  
  // Get category with articles
  export async function getFAQCategoryWithArticles(categorySlug: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .rpc('get_faqs_by_category', { category_slug: categorySlug })
      .single()
  
    if (error) throw error
    return data
  }