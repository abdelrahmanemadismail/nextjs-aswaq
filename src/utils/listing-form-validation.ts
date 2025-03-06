// utils/listing-form-validation.ts

import { ListingFormData, ListingStep } from '@/types/listing'

// Validation result interface
export interface ValidationResult {
  valid: boolean
  errors?: Record<string, string>
}

// Maps steps to their corresponding route paths
export const stepToPath = {
  category: 'category',
  images: 'images',
  details: 'details',
  package: 'package',
  review: 'review'
}

// Validate the category step
export async function validateCategoryStep(
  formData: Partial<ListingFormData>
): Promise<ValidationResult> {
  const errors: Record<string, string> = {}
  
  if (!formData.category?.main_category) {
    errors['category'] = 'Please select a category'
    return { valid: false, errors }
  }
  
  // Subcategory validation will be handled in the component
  
  return { valid: true }
}

// Validate the images step
export async function validateImagesStep(
  formData: Partial<ListingFormData>
): Promise<ValidationResult> {
  const errors: Record<string, string> = {}
  
  if (!formData.images || formData.images.length === 0) {
    errors['images'] = 'Please upload at least one image'
    return { valid: false, errors }
  }
  
  return { valid: true }
}

// Validate the details step
export async function validateDetailsStep(
  formData: Partial<ListingFormData>
): Promise<ValidationResult> {
  const errors: Record<string, string> = {}
  
  const details = formData.details
  
  if (!details) {
    errors['details'] = 'Listing details are required'
    return { valid: false, errors }
  }
  
  if (!details.title || details.title.length < 3) {
    errors['details.title'] = 'Title must be at least 3 characters'
  }
  
  if (!details.description || details.description.length < 10) {
    errors['details.description'] = 'Description must be at least 10 characters'
  }
  
  if (!details.price || isNaN(Number(details.price)) || Number(details.price) < 0) {
    errors['details.price'] = 'Price must be a valid number'
  }
  
  if (!details.location_id) {
    errors['details.location_id'] = 'Please select a location'
  }
  
  if (!details.contact_method || details.contact_method.length === 0) {
    errors['details.contact_method'] = 'Please select at least one contact method'
  }
  
  // If there are any errors, return them
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }
  
  return { valid: true }
}

// Validate the package step
export async function validatePackageStep(
  formData: Partial<ListingFormData>
): Promise<ValidationResult> {
  const errors: Record<string, string> = {}
  
  if (!formData.package_details?.user_package_id) {
    errors['package_details.user_package_id'] = 'Please select a package'
    return { valid: false, errors }
  }
  
  return { valid: true }
}

// Main validation function that delegates to specific step validators
export async function validateStep(
  step: string,
  formData: Partial<ListingFormData>
): Promise<ValidationResult> {
  switch (step) {
    case 'category':
      return validateCategoryStep(formData)
    case 'images':
      return validateImagesStep(formData)
    case 'details':
      return validateDetailsStep(formData)
    case 'package':
      return validatePackageStep(formData)
    case 'review':
      // The review step doesn't need additional validation
      return { valid: true }
    default:
      return { valid: false, errors: { general: 'Invalid step' } }
  }
}

// Function to determine the next step
export function getNextStep(currentStep: ListingStep): ListingStep | null {
  switch (currentStep) {
    case 'category':
      return 'images'
    case 'images':
      return 'details'
    case 'details':
      return 'package'
    case 'package':
      return 'review'
    case 'review':
      return null // No next step after review
    default:
      return null
  }
}

// Function to determine the previous step
export function getPreviousStep(currentStep: ListingStep): ListingStep | null {
  switch (currentStep) {
    case 'images':
      return 'category'
    case 'details':
      return 'images'
    case 'package':
      return 'details'
    case 'review':
      return 'package'
    default:
      return null // No previous step before category
  }
}