// services/client-upload.ts

import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Interface for image metadata
export interface ProcessedImageMetadata {
  id: string;
  originalName: string;
  size: number;
  type: string;
  width: number;
  height: number;
}

// Process and resize an image on the client side
export async function processImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<{
  processedBlob: Blob;
  metadata: ProcessedImageMetadata;
}> {
  return new Promise((resolve, reject) => {
    // Create an image object to get dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      // Clean up the object URL
      URL.revokeObjectURL(objectUrl);
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
      
      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw the image on the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with the specified quality
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not create blob from canvas'));
            return;
          }
          
          // Create metadata
          const metadata: ProcessedImageMetadata = {
            id: uuidv4(),
            originalName: file.name,
            size: blob.size,
            type: blob.type,
            width,
            height
          };
          
          resolve({ processedBlob: blob, metadata });
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    
    img.src = objectUrl;
  });
}

// Upload a processed image directly to Supabase storage
export async function uploadProcessedImage(
  blob: Blob,
  metadata: ProcessedImageMetadata,
  userId: string,
  listingId: string
): Promise<string> {
  const supabase = createClient();
  
  // Create a file name with extension
  const fileExt = metadata.originalName.split('.').pop() || 'jpg';
  const fileName = `${metadata.id}.${fileExt}`;
  const filePath = `${userId}/${listingId}/${fileName}`;
  
  // Convert blob to file
  const file = new File([blob], fileName, { type: metadata.type });
  
  // Upload to storage
  const { data, error } = await supabase.storage
    .from('listings')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    
  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('listings')
    .getPublicUrl(data.path);
    
  return publicUrl;
}

// Process and upload multiple images in sequence
export async function processAndUploadImages(
  files: File[],
  userId: string,
  listingId: string,
  progressCallback?: (current: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];
  const supabase = createClient();
  
  // Process images one by one to avoid memory issues
  for (let i = 0; i < files.length; i++) {
    try {
      // Update progress
      if (progressCallback) {
        progressCallback(i, files.length);
      }
      
      // Process the image
      const { processedBlob, metadata } = await processImage(files[i]);
      
      // Upload the processed image
      const url = await uploadProcessedImage(processedBlob, metadata, userId, listingId);
      urls.push(url);
      
      // Update the listing with the current set of images after each successful upload
      if (urls.length > 0) {
        await supabase
          .from('listings')
          .update({ images: urls })
          .eq('id', listingId);
      }
    } catch (error) {
      console.error(`Error processing/uploading image ${i}:`, error);
      // Continue with other images
    }
  }
  
  // Final progress update
  if (progressCallback) {
    progressCallback(files.length, files.length);
  }
  
  return urls;
}