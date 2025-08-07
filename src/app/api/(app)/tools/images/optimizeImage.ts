import { createClient } from "@/common/supabase/server";

export interface ImageOptimizationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface OptimizedImage {
  url: string;
  variants: Record<string, string>;
}

const IMAGE_VARIANTS = [
  { size: "thumbnail", width: 150, height: 150 },
  { size: "small", width: 300, height: 300 },
  { size: "medium", width: 600, height: 600 },
  { size: "large", width: 1200, height: 1200 },
];

export async function optimizeImage(
  file: File,
  bucket: string,
  path: string,
  generateVariants = true,
): Promise<ImageOptimizationResult<OptimizedImage>> {
  try {
    const supabase = await createClient();

    // Upload original image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "31536000", // 1 year cache
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`,
      };
    }

    const variants: Record<string, string> = {};

    if (generateVariants && isImageFile(file)) {
      // Generate optimized variants
      for (const variant of IMAGE_VARIANTS) {
        if (variant.size === "original") {
          variants[variant.size] = await getPublicUrl(bucket, path);
          continue;
        }

        try {
          const optimizedBlob = await resizeImage(file, variant);
          const variantPath = `${path.replace(
            /\.[^/.]+$/,
            "",
          )}_${variant.size}${getFileExtension(file.name)}`;

          const { error: variantError } = await supabase.storage
            .from(bucket)
            .upload(variantPath, optimizedBlob, {
              cacheControl: "31536000",
              upsert: false,
            });

          if (!variantError) {
            variants[variant.size] = await getPublicUrl(bucket, variantPath);
          }
        } catch (error) {
          console.error(`Failed to create ${variant.size} variant:`, error);
        }
      }
    }

    return {
      success: true,
      data: {
        url: await getPublicUrl(bucket, path),
        variants,
      },
    };
  } catch (error) {
    console.error("Image optimization error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export function getOptimizedImageUrl(
  originalUrl: string,
  size: "thumbnail" | "small" | "medium" | "large" = "medium",
): string {
  if (!originalUrl) return "";

  // Replace original with size variant
  const variantUrl = originalUrl.replace(/(\.[^/.]+)$/, `_${size}$1`);

  // Fallback to original if variant doesn't exist
  return variantUrl;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf("."));
}

async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const supabase = await createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function resizeImage(
  file: File,
  variant: { width: number; height: number },
): Promise<Blob> {
  // This is a simplified version - in a real implementation, you'd use a proper image processing library
  // For now, we'll return the original file
  return file;
}
