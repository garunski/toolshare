import { createClient } from "@/common/supabase/server";

interface ImageVariant {
  size: "thumbnail" | "small" | "medium" | "large" | "original";
  width: number;
  height: number;
  quality: number;
}

export const IMAGE_VARIANTS: ImageVariant[] = [
  { size: "thumbnail", width: 150, height: 150, quality: 80 },
  { size: "small", width: 300, height: 300, quality: 85 },
  { size: "medium", width: 600, height: 600, quality: 90 },
  { size: "large", width: 1200, height: 1200, quality: 95 },
  { size: "original", width: 0, height: 0, quality: 100 },
];

export class ImageHelpers {
  /**
   * Optimize image using canvas
   */
  static async optimizeImage(file: File, variant: ImageVariant): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        const { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          variant.width,
          variant.height,
        );

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to create blob"));
              }
            },
            "image/jpeg",
            variant.quality / 100,
          );
        } else {
          reject(new Error("Failed to get canvas context"));
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Process image with multiple variants
   */
  static async processImage(file: File): Promise<Record<string, Blob>> {
    const variants: Record<string, Blob> = {};

    for (const variant of IMAGE_VARIANTS) {
      try {
        variants[variant.size] = await this.optimizeImage(file, variant);
      } catch (error) {
        console.error(`Failed to process ${variant.size} variant:`, error);
      }
    }

    return variants;
  }

  /**
   * Calculate dimensions maintaining aspect ratio
   */
  static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
  ): { width: number; height: number } {
    if (maxWidth === 0 && maxHeight === 0) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    let width = maxWidth;
    let height = maxHeight;

    if (maxWidth === 0) {
      width = maxHeight * aspectRatio;
    } else if (maxHeight === 0) {
      height = maxWidth / aspectRatio;
    } else {
      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Check if file is an image
   */
  static isImageFile(file: File): boolean {
    return file.type.startsWith("image/");
  }

  /**
   * Get file extension
   */
  static getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf("."));
  }

  /**
   * Get public URL from Supabase storage
   */
  static async getPublicUrl(bucket: string, path: string): Promise<string> {
    const supabase = await createClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
