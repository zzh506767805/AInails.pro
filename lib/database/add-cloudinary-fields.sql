-- Add Cloudinary-related fields to image_generations table
-- This migration adds support for storing Cloudinary URLs and metadata

-- Add cloudinary_public_id column to store Cloudinary public ID for image management
ALTER TABLE image_generations 
ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;

-- Add enhanced_prompt column to store the AI-enhanced prompt used for generation
ALTER TABLE image_generations 
ADD COLUMN IF NOT EXISTS enhanced_prompt TEXT;

-- Add index for Cloudinary public ID for faster lookups
CREATE INDEX IF NOT EXISTS idx_image_generations_cloudinary_public_id 
  ON public.image_generations(cloudinary_public_id);

-- Add index for enhanced_prompt for search functionality
CREATE INDEX IF NOT EXISTS idx_image_generations_enhanced_prompt 
  ON public.image_generations USING gin(to_tsvector('english', enhanced_prompt));

-- Add comments for better documentation
COMMENT ON COLUMN image_generations.cloudinary_public_id IS 
'Cloudinary public ID for image management (delete, transform, etc.)';

COMMENT ON COLUMN image_generations.enhanced_prompt IS 
'AI-enhanced prompt used for generation (includes skin tone, styling instructions, etc.)';

-- Update table comment
COMMENT ON TABLE image_generations IS 
'Stores AI-generated image metadata with Cloudinary integration for nail art designs';
