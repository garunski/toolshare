'use client';

import { useFormContext } from 'react-hook-form';

import { Input } from '@/primitives/input';
import { Textarea } from '@/primitives/textarea';
import { ValidationMessage } from '@/common/forms/ValidationMessage';

interface Props {
  className?: string;
}

export function BasicItemFields({ className }: Props) {
  const { register, formState: { errors }, watch } = useFormContext();
  const nameValue = watch('name');
  const descriptionValue = watch('description');

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h2>
        <p className="text-sm text-gray-600 mb-4">
          Provide the essential details about your item that will help others understand what you&apos;re sharing.
        </p>
      </div>

      <div className="space-y-4">
        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Name *
          </label>
          <Input
            {...register('name', {
              required: 'Item name is required',
              minLength: { value: 3, message: 'Item name must be at least 3 characters' },
              maxLength: { value: 100, message: 'Item name must be no more than 100 characters' }
            })}
            placeholder="Enter a descriptive name for your item"
            maxLength={100}
          />
          {errors.name && (
            <ValidationMessage type="error" message={errors.name.message as string} className="mt-2" />
          )}
          {nameValue && (
            <p className="mt-1 text-xs text-gray-500 text-right">{nameValue.length} / 100 characters</p>
          )}
        </div>

        {/* Item Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <Textarea
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters' },
              maxLength: { value: 500, message: 'Description must be no more than 500 characters' }
            })}
            placeholder="Describe your item in detail. Include its condition, features, and any relevant information."
            rows={4}
            maxLength={500}
          />
          {errors.description && (
            <ValidationMessage type="error" message={errors.description.message as string} className="mt-2" />
          )}
          {descriptionValue && (
            <p className="mt-1 text-xs text-gray-500 text-right">{descriptionValue.length} / 500 characters</p>
          )}
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition *
          </label>
          <select
            {...register('condition', { required: 'Please select the item condition' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select condition</option>
            <option value="new">New</option>
            <option value="like_new">Like New</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
          {errors.condition && (
            <ValidationMessage type="error" message={errors.condition.message as string} className="mt-2" />
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <Input
            {...register('location', {
              maxLength: { value: 100, message: 'Location must be no more than 100 characters' }
            })}
            placeholder="City, State or general area"
            maxLength={100}
          />
          {errors.location && (
            <ValidationMessage type="error" message={errors.location.message as string} className="mt-2" />
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <Input
            {...register('tags')}
            placeholder="Enter tags separated by commas (e.g., power tools, DIY, construction)"
            maxLength={200}
          />
          <p className="mt-1 text-xs text-gray-500">
            Tags help others find your item. Separate multiple tags with commas.
          </p>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Be specific and honest about your item&apos;s condition. 
              Clear descriptions and accurate condition ratings help build trust with potential borrowers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 