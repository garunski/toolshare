import {
  getFileExtension,
  getPublicUrl,
  IMAGE_VARIANTS,
  isImageFile,
  resizeImage,
} from "./imageOptimizationHelpers";

export class ImageOptimizationService {
  /**
   * Upload and optimize image
   */
  static async uploadOptimizedImage(
    file: File,
    bucket: string,
    path: string,
    generateVariants = true,
  ): Promise<{ url: string; variants: Record<string, string> }> {
    const { createClient } = await import("@/common/supabase/client");
    const supabase = createClient();

    // Upload original image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "31536000", // 1 year cache
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const variants: Record<string, string> = {};

    if (generateVariants && isImageFile(file)) {
      // Generate optimized variants
      for (const variant of IMAGE_VARIANTS) {
        if (variant.size === "original") {
          variants[variant.size] = getPublicUrl(bucket, path);
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
            variants[variant.size] = getPublicUrl(bucket, variantPath);
          }
        } catch (error) {
          console.error(`Failed to create ${variant.size} variant:`, error);
        }
      }
    }

    return {
      url: getPublicUrl(bucket, path),
      variants,
    };
  }

  /**
   * Get optimized image URL for specific size
   */
  static getOptimizedImageUrl(
    originalUrl: string,
    size: "thumbnail" | "small" | "medium" | "large" = "medium",
  ): string {
    if (!originalUrl) return "";

    // Replace original with size variant
    const variantUrl = originalUrl.replace(/(\.[^/.]+)$/, `_${size}$1`);

    // Fallback to original if variant doesn't exist
    return variantUrl;
  }

  /**
   * Preload critical images
   */
  static preloadImages(urls: string[]): void {
    urls.forEach((url) => {
      if (url) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = url;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Lazy load image with intersection observer
   */
  static setupLazyLoading(): void {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;

            if (src) {
              img.src = src;
              img.classList.remove("lazy");
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Observe all lazy images
      document.querySelectorAll("img[data-src]").forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }
}
