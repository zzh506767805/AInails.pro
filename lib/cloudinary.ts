import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a base64 image to Cloudinary
 * @param base64Data - Base64 encoded image data (with or without data URI prefix)
 * @param folder - Cloudinary folder to organize images (optional)
 * @param publicId - Custom public ID for the image (optional)
 * @returns Cloudinary upload result with secure_url and public_id
 */
export async function uploadImageToCloudinary(
  base64Data: string,
  folder: string = 'ainails',
  publicId?: string
) {
  try {
    // Remove data URI prefix if present (e.g., "data:image/png;base64,")
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const uploadOptions: any = {
      resource_type: 'image',
      folder: folder,
      format: 'png', // Force PNG format for nail art images
      quality: 'auto:good', // Automatic quality optimization
      fetch_format: 'auto', // Auto format selection (WebP, AVIF)
      flags: 'progressive', // Progressive JPEG for better loading
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${cleanBase64}`,
      uploadOptions
    );

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns Deletion result
 */
export async function deleteImageFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Generate optimized image URLs with transformations
 * @param publicId - The public ID of the image
 * @param transformations - Cloudinary transformation options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  transformations: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
) {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto',
  } = transformations;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: format,
    secure: true,
  });
}

/**
 * Get thumbnail URL for nail art images
 * @param publicId - The public ID of the image
 * @param size - Thumbnail size (default: 300)
 * @returns Thumbnail URL
 */
export function getThumbnailUrl(publicId: string, size: number = 300) {
  return getOptimizedImageUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto:good',
  });
}

export default cloudinary;
