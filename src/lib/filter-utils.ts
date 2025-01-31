import { ReadonlyURLSearchParams } from "next/navigation"

export const handleSearchFilter = (
  search: string,
  searchParams: ReadonlyURLSearchParams,
  options?: { 
    paramName?: string,
    resetPage?: boolean 
  }
) => {
  const params = new URLSearchParams(searchParams)
  const paramName = options?.paramName || "search"
  
  if (search) {
    params.set(paramName, search)
  } else {
    params.delete(paramName)
  }
  
  if (options?.resetPage !== false) {
    params.set("page", "1")
  }
  
  return params.toString()
}

export const handleSortFilter = (
  value: string,
  searchParams: ReadonlyURLSearchParams,
  options?: {
    paramName?: string,
    resetPage?: boolean
  }
) => {
  const params = new URLSearchParams(searchParams)
  const paramName = options?.paramName || "sort"
  
  params.set(paramName, value)
  
  if (options?.resetPage !== false) {
    params.set("page", "1")
  }
  
  return params.toString()
}

export const handleCategoryFilter = (
  category: string,
  searchParams: URLSearchParams,
  options?: {
    paramName?: string,
    resetPage?: boolean
  }
) => {
  const params = new URLSearchParams(searchParams)
  const paramName = options?.paramName || "category"
  
  if (category) {
    params.set(paramName, category)
  } else {
    params.delete(paramName)
  }
  
  if (options?.resetPage !== false) {
    params.set("page", "1")
  }
  
  return params.toString()
}

export const handleMinPriceFilter = (
  price: number | string,
  searchParams: ReadonlyURLSearchParams,
  options?: {
    paramName?: string,
    resetPage?: boolean
  }
) => {
  const params = new URLSearchParams(searchParams)
  const paramName = options?.paramName || "minPrice"
  
  if (price) {
    params.set(paramName, price.toString())
  } else {
    params.delete(paramName)
  }
  
  if (options?.resetPage !== false) {
    params.set("page", "1")
  }
  
  return params.toString()
}

export const handleMaxPriceFilter = (
  price: number | string,
  searchParams: ReadonlyURLSearchParams,
  options?: {
    paramName?: string,
    resetPage?: boolean
  }
) => {
  const params = new URLSearchParams(searchParams)
  const paramName = options?.paramName || "maxPrice"
  
  if (price) {
    params.set(paramName, price.toString())
  } else {
    params.delete(paramName)
  }
  
  if (options?.resetPage !== false) {
    params.set("page", "1")
  }
  
  return params.toString()
} 