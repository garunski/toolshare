"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

// Removed direct operation imports - now using API routes
import { toolCreationSchema } from "@/common/validators/toolCreationValidator";

type FormStep = "basic" | "details" | "images" | "review";

export function useAddToolForm(userId: string, onSuccess: () => void) {
  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(toolCreationSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "Power Tools",
      condition: "good",
      is_available: true,
    },
  });

  const steps: { key: FormStep; title: string; description: string }[] = [
    {
      key: "basic",
      title: "Basic Information",
      description: "Tool name and category",
    },
    {
      key: "details",
      title: "Details",
      description: "Description and condition",
    },
    {
      key: "images",
      title: "Images",
      description: "Upload photos of your tool",
    },
    { key: "review", title: "Review", description: "Review and submit" },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

  const nextStep = () => {
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].key);
    }
  };

  const prevStep = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].key);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("userId", userId);

      const response = await fetch("/api/tools/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }

      const result = await response.json();
      const successfulUploads = result.urls || [];

      setUploadedImages((prev) => [...prev, ...successfulUploads]);

      if (result.failedCount > 0) {
        setError(`Failed to upload ${result.failedCount} image(s)`);
      }
    } catch (err) {
      setError("Failed to upload images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tools/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          images: uploadedImages,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create tool");
      }

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to create tool");
      }
    } catch (err) {
      setError("Failed to create tool");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    currentStep,
    isLoading,
    error,
    uploadedImages,
    steps,
    currentStepIndex,
    nextStep,
    prevStep,
    handleImageUpload,
    handleSubmit,
  };
}
