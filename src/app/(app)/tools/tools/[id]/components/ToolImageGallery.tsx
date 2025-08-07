"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/primitives/button";

interface ToolImageGalleryProps {
  images: string[];
}

export function ToolImageGallery({ images }: ToolImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={images[currentImageIndex]}
          alt={`Tool image ${currentImageIndex + 1}`}
          fill
          className="object-cover"
        />

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              color="zinc"
              className="absolute top-1/2 left-2 -translate-y-1/2 transform bg-white/80 hover:bg-white"
              onClick={previousImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              color="zinc"
              className="absolute top-1/2 right-2 -translate-y-1/2 transform bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                index === currentImageIndex
                  ? "border-blue-500"
                  : "border-gray-200"
              }`}
            >
              <Image
                src={image}
                alt={`Tool thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
