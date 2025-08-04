# Field Renderers

## Individual Field Type Components

### 1. Multi-Select Field Component
- [ ] Create: `src/common/forms/MultiSelect.tsx` (under 150 lines)

```tsx
// src/common/forms/MultiSelect.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/primitives/badge';
import { Button } from '@/primitives/button';
import { Input } from '@/primitives/input';
import { ChevronDownIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { AttributeOption } from '@/types/attributes';

interface Props {
  options: AttributeOption[];
  value: string[];
  onChange: (values: string[]) => void;
  error?: string;
  placeholder?: string;
  maxSelections?: number;
}

export function MultiSelect({ options, value, onChange, error, placeholder, maxSelections }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter(option => value.includes(option.value));
  const availableOptions = filteredOptions.filter(option => !value.includes(option.value));

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return; // Don't add if max reached
      }
      onChange([...value, optionValue]);
    }
  };

  const handleRemoveOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`min-h-[40px] border rounded-md px-3 py-2 cursor-pointer transition-colors ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        } ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500">
                {placeholder || 'Select options...'}
              </span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map(option => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{option.label}</span>
                    <button
                      onClick={(e) => handleRemoveOption(option.value, e)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {selectedOptions.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearAll}
                className="h-6 px-2"
              >
                Clear
              </Button>
            )}
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {maxSelections && (
        <p className="mt-1 text-xs text-gray-500">
          {value.length} / {maxSelections} selected
        </p>
      )}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <Input
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
              size="sm"
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {availableOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm ? 'No options match your search' : 'No more options available'}
              </div>
            ) : (
              availableOptions.map(option => (
                <div
                  key={option.value}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                  onClick={() => handleToggleOption(option.value)}
                >
                  <span className="text-sm">{option.label}</span>
                  {maxSelections && value.length >= maxSelections && (
                    <span className="text-xs text-gray-400">Max reached</span>
                  )}
                </div>
              ))
            )}
          </div>

          {selectedOptions.length > 0 && (
            <div className="border-t p-2 bg-gray-50">
              <div className="text-xs text-gray-600 mb-1">Selected:</div>
              <div className="flex flex-wrap gap-1">
                {selectedOptions.slice(0, 3).map(option => (
                  <Badge key={option.value} variant="outline" size="sm">
                    {option.label}
                  </Badge>
                ))}
                {selectedOptions.length > 3 && (
                  <Badge variant="outline" size="sm">
                    +{selectedOptions.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 2. Date Picker Component
- [ ] Create: `src/common/forms/DatePicker.tsx` (under 150 lines)

```tsx
// src/common/forms/DatePicker.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/primitives/input';
import { Button } from '@/primitives/button';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Props {
  value?: string;
  onChange: (date: string) => void;
  error?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

export function DatePicker({ value, onChange, error, placeholder, minDate, maxDate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [inputValue, setInputValue] = useState(value || '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setInputValue(value);
      setDisplayDate(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);
    
    // Try to parse the date
    const date = new Date(inputVal);
    if (!isNaN(date.getTime()) && inputVal.length >= 8) {
      onChange(inputVal);
      setDisplayDate(date);
    }
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setInputValue(dateString);
    onChange(dateString);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isDateDisabled = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    if (minDate && dateString < minDate) return true;
    if (maxDate && dateString > maxDate) return true;
    return false;
  };

  const renderCalendar = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const date = new Date(currentDate);
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = value && date.toISOString().split('T')[0] === value;
      const isDisabled = isDateDisabled(date);

      days.push(
        <button
          key={i}
          onClick={() => !isDisabled && handleDateSelect(date)}
          disabled={isDisabled}
          className={`
            w-8 h-8 text-sm rounded-md transition-colors
            ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
            ${isToday ? 'bg-blue-100 text-blue-900' : ''}
            ${isSelected ? 'bg-blue-600 text-white' : ''}
            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
            ${isSelected && !isDisabled ? 'hover:bg-blue-700' : ''}
          `}
        >
          {date.getDate()}
        </button>
      );

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          error={error}
          placeholder={placeholder || 'YYYY-MM-DD'}
          rightIcon={
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          }
        />
      </div>

      {isOpen && (
        <div className="absolute z-20 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-64">
          <div className="flex items-center justify-between mb-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigateMonth('prev')}
              className="p-1"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            
            <div className="font-medium">
              {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigateMonth('next')}
              className="p-1"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-xs text-gray-500 text-center p-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setInputValue(today);
                onChange(today);
                setIsOpen(false);
              }}
            >
              Today
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setInputValue('');
                onChange('');
                setIsOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3. Form Progress Indicator Component
- [ ] Create: `src/common/forms/FormProgressIndicator.tsx` (under 150 lines)

```tsx
// src/common/forms/FormProgressIndicator.tsx
'use client';

import { useMemo } from 'react';
import { Badge } from '@/primitives/badge';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { FormUtils } from './FormStateManager';

interface Props {
  totalFields: number;
  filledFields: number;
  requiredFields?: number;
  showDetails?: boolean;
}

export function FormProgressIndicator({ 
  totalFields, 
  filledFields, 
  requiredFields,
  showDetails = true 
}: Props) {
  const progress = useMemo(() => {
    return FormUtils.calculateCompletionPercentage(totalFields, filledFields);
  }, [totalFields, filledFields]);

  const progressColor = useMemo(() => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  }, [progress]);

  const textColor = useMemo(() => {
    if (progress === 100) return 'text-green-700';
    if (progress >= 75) return 'text-blue-700';
    if (progress >= 50) return 'text-yellow-700';
    return 'text-gray-600';
  }, [progress]);

  if (totalFields === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {progress === 100 && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          )}
          <span className={`font-medium ${textColor}`}>
            {progress === 100 ? 'Form Complete!' : 'Form Progress'}
          </span>
        </div>
        
        <Badge variant="secondary" className={textColor}>
          {filledFields} / {totalFields} fields
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{progress}% complete</span>
          
          {requiredFields && requiredFields > 0 && (
            <span>
              {Math.min(filledFields, requiredFields)} / {requiredFields} required fields
            </span>
          )}
        </div>
      )}

      {/* Completion Message */}
      {progress === 100 && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            🎉 All fields have been completed! You can now submit the form.
          </p>
        </div>
      )}

      {/* Encouragement Messages */}
      {progress > 0 && progress < 100 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            {progress >= 75 ? 
              "You're almost done! Just a few more fields to go." :
              progress >= 50 ?
              "Great progress! You're halfway there." :
              progress >= 25 ?
              "Good start! Keep going to complete your form." :
              "Fill out the fields below to get started."
            }
          </p>
        </div>
      )}
    </div>
  );
}
```

### 4. Image Uploader Component
- [ ] Create: `src/app/tools/add/components/ImageUploader.tsx` (under 150 lines)

```tsx
// src/app/tools/add/components/ImageUploader.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/primitives/button';
import { Badge } from '@/primitives/badge';
import { PhotoIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Props {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
}

export function ImageUploader({ images, onImagesChange, maxImages = 5, maxFileSize = 5 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newImages: string[] = [];
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    setUploading(true);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file.`);
        continue;
      }

      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
        continue;
      }

      try {
        // Convert to data URL for preview (in real app, would upload to storage)
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newImages.push(dataUrl);
      } catch (error) {
        console.error('Error processing image:', error);
        alert(`Failed to process ${file.name}`);
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }

    setUploading(false);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">
              Drop images here or click to browse
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to {maxFileSize}MB ({maxImages - images.length} remaining)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>

              {index === 0 && (
                <Badge 
                  className="absolute bottom-2 left-2 bg-blue-600 text-white"
                  size="sm"
                >
                  Primary
                </Badge>
              )}
            </div>
          ))}

          {/* Add More Button */}
          {canAddMore && (
            <div
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <PlusIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Add More</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      {uploading && (
        <div className="flex items-center space-x-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span>Processing images...</span>
        </div>
      )}

      {images.length >= maxImages && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            Maximum number of images ({maxImages}) reached. Remove an image to add more.
          </p>
        </div>
      )}

      {images.length > 0 && (
        <div className="text-xs text-gray-500">
          <p>💡 Tip: The first image will be used as the primary image for your item.</p>
        </div>
      )}
    </div>
  );
}
```

## Success Criteria
- [ ] Multi-select component with search and filtering
- [ ] Date picker with calendar interface and validation  
- [ ] Form progress indicator with completion tracking
- [ ] Image uploader with drag-and-drop support
- [ ] All field renderers handle validation and errors properly
- [ ] Accessible form controls with proper ARIA labels
- [ ] All files under 150 lines with proper imports 