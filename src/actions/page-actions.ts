'use server'
// actions/page-actions.ts
import { createClient } from '@/utils/supabase/server'
import { CreatePageInput, UpdatePageInput, Page } from '@/types/page'
import { unstable_noStore as noStore } from 'next/cache';

export async function getPages(): Promise<Page[]> {
  noStore();
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}
export async function getPageById(id: string): Promise<Page | null> {
    noStore();
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching page:', error)
      return null
    }
    return data
  }
export async function getPageBySlug(slug: string): Promise<Page | null> {
  noStore();
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) return null
  return data
}

export async function createPage(input: CreatePageInput) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('pages')
    .insert([input])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updatePage(input: UpdatePageInput) {
  const supabase = await createClient()
  const { id, ...updateData } = input
  
  const { data, error } = await supabase
    .from('pages')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deletePage(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

export async function publishPage(id: string, publish: boolean) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('pages')
    .update({ 
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}