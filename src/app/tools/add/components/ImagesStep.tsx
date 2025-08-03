"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/primitives/button";

interface ImagesStepProps {
  onImageUpload: (files: File[]) => Promise<void>;
  uploadedImages: string[];
}

export function ImagesStep({ onImageUpload, uploadedImages }: ImagesStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      await onImageUpload(files);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    // This would need to be implemented to remove images from the uploadedImages array
    // For now, we'll just show the UI
    console.log("Remove image at index:", index);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Upload Tool Photos
        </h3>
        <p className="text-sm text-gray-600">
          Add clear photos of your tool from different angles. This helps
          borrowers understand what they&apos;re borrowing.
        </p>
      </div>

      {/* Upload Area */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <Button
              type="button"
              outline
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Choose Images"}
            </Button>
          </div>
          <p className="text-sm text-gray-500">PNG, JPG, WebP up to 5MB each</p>
        </div>
      </div>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-900">
            Uploaded Images ({uploadedImages.length})
          </h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {uploadedImages.map((imageUrl, index) => (
              <div key={index} className="group relative">
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={imageUrl}
                    alt={`Tool image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 cursor-pointer rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Tips */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h4 className="mb-2 text-sm font-medium text-blue-900">Photo Tips</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Take photos from multiple angles</li>
          <li>• Include any damage or wear</li>
          <li>• Show the tool in good lighting</li>
          <li>• Include any accessories or attachments</li>
        </ul>
      </div>
    </div>
  );
}
