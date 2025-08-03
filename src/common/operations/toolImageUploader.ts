import { supabase } from "@/common/supabase";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageUploadData {
  file: File;
  toolId: string;
  userId: string;
}

export class ToolImageUploader {
  private static readonly BUCKET_NAME = "tool-images";
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  static async uploadImage(data: ImageUploadData): Promise<UploadResult> {
    try {
      // Validate file
      const validationResult = this.validateFile(data.file);
      if (!validationResult.success) {
        return { success: false, error: validationResult.error };
      }

      // Generate unique filename
      const fileExtension = data.file.name.split(".").pop();
      const fileName = `${data.toolId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, data.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error("Image upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      };
    }
  }

  static async deleteImage(imageUrl: string): Promise<UploadResult> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const toolId = urlParts[urlParts.length - 2];
      const filePath = `${toolId}/${fileName}`;

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error("Delete error:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Image deletion error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown deletion error",
      };
    }
  }

  static async uploadMultipleImages(
    files: File[],
    toolId: string,
    userId: string,
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadImage({ file, toolId, userId }),
    );

    return Promise.all(uploadPromises);
  }

  private static validateFile(file: File): {
    success: boolean;
    error?: string;
  } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size must be less than ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Only JPEG, PNG, and WebP images are allowed",
      };
    }

    return { success: true };
  }

  static getImageUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
