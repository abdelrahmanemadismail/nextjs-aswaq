'use server'

import { createClient } from '@/utils/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'

export interface PackageType {
  id: string
  name: string
  description: string
  listing_count: number
  bonus_listing_count: number
  duration_days: number
  validity_days: number
  is_featured: boolean
  price: number
  package_type: 'free_tier' | 'duration' | 'bulk'
}

export async function getPackages(): Promise<{
  freeTierPackages: PackageType[]
  durationPackages: PackageType[]
  bulkPackages: PackageType[]
}> {
  noStore()
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('price', { ascending: true })
    
    if (error) throw error
    
    const packages = data as PackageType[]
    
    return {
      freeTierPackages: packages.filter(pkg => pkg.package_type === 'free_tier'),
      durationPackages: packages.filter(pkg => pkg.package_type === 'duration'),
      bulkPackages: packages.filter(pkg => pkg.package_type === 'bulk')
    }
  } catch (error) {
    console.error('Error fetching packages:', error)
    return {
      freeTierPackages: [],
      durationPackages: [],
      bulkPackages: []
    }
  }
}