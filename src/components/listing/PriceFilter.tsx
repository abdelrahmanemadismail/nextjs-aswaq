'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/use-translation'

interface PriceFilterProps {
  title?: string
  currency?: string
}

export function PriceFilter({ title, currency = "AED" }: PriceFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, getLocalizedPath } = useTranslation()
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '')
    setMaxPrice(searchParams.get('maxPrice') || '')
  }, [searchParams])

  const handlePriceChange = useCallback((type: 'min' | 'max', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(type === 'min' ? 'minPrice' : 'maxPrice', value)
      if (type === 'min') {
        setMinPrice(value)
      } else {
        setMaxPrice(value)
      }
    } else {
      params.delete(type === 'min' ? 'minPrice' : 'maxPrice')
      if (type === 'min') {
        setMinPrice('')
      } else {
        setMaxPrice('')
      }
    }
    params.set('page', '1')
    
    router.push(getLocalizedPath(`/listings?${params.toString()}`))
  }, [searchParams, router, getLocalizedPath])

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-3">{title || t.listings.filters.price} ({currency})</h3>
      <div className="flex gap-2">
        <input 
          type="number" 
          placeholder="0" 
          value={minPrice}
          onChange={(e) => handlePriceChange('min', e.target.value)}
          className="w-1/2 p-2 border rounded" 
        />
        <input 
          type="number" 
          placeholder="3,000,000" 
          value={maxPrice}
          onChange={(e) => handlePriceChange('max', e.target.value)}
          className="w-1/2 p-2 border rounded" 
        />
      </div>
    </div>
  )
}