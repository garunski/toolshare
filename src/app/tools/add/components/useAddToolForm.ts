"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ToolDataProcessor } from "@/common/operations/toolDataProcessor";
import { ToolImageUploader } from "@/common/operations/toolImageUploader";
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
      const tempToolId = `temp-${Date.now()}`;
      const uploadResults = await ToolImageUploader.uploadMultipleImages(
        files,
        tempToolId,
        userId,
      );

      const successfulUploads = uploadResults
        .filter((result) => result.success)
        .map((result) => result.url!)
        .filter(Boolean);

      setUploadedImages((prev) => [...prev, ...successfulUploads]);

      const failedUploads = uploadResults.filter((result) => !result.success);
      if (failedUploads.length > 0) {
        setError(`Failed to upload ${failedUploads.length} image(s)`);
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
      const result = await ToolDataProcessor.createTool(data, userId);

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
