"use client";

import { UseFormReturn } from "react-hook-form";

import { BasicInfoStep } from "./BasicInfoStep";
import { DetailsStep } from "./DetailsStep";
import { ImagesStep } from "./ImagesStep";
import { ReviewStep } from "./ReviewStep";

interface AddToolFormStepsProps {
  currentStep: "basic" | "details" | "images" | "review";
  form: UseFormReturn<any>;
  uploadedImages: string[];
  onImageUpload: (files: File[]) => Promise<void>;
}

export function AddToolFormSteps({
  currentStep,
  form,
  uploadedImages,
  onImageUpload,
}: AddToolFormStepsProps) {
  switch (currentStep) {
    case "basic":
      return <BasicInfoStep form={form} />;
    case "details":
      return <DetailsStep form={form} />;
    case "images":
      return (
        <ImagesStep
          onImageUpload={onImageUpload}
          uploadedImages={uploadedImages}
        />
      );
    case "review":
      return <ReviewStep form={form} uploadedImages={uploadedImages} />;
    default:
      return null;
  }
}
