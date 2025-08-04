# UX Enhancements

## User Experience Improvements for Dynamic Forms

### 1. Auto-Save Hook
- [ ] Create: `src/common/forms/useAutoSave.ts` (under 150 lines)

```typescript
// src/common/forms/useAutoSave.ts
import { useEffect, useCallback, useRef } from 'react';
import { useFormStateManager, FormUtils } from './FormStateManager';

interface UseAutoSaveProps {
  formKey: string;
  formData: Record<string, any>;
  isValid: boolean;
  enabled?: boolean;
  saveInterval?: number; // in milliseconds
  onSave?: (data: any) => void;
  onSaveError?: (error: Error) => void;
}

interface AutoSaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: Error | null;
}

export function useAutoSave({
  formKey,
  formData,
  isValid,
  enabled = true,
  saveInterval = 10000, // 10 seconds
  onSave,
  onSaveError
}: UseAutoSaveProps) {
  const { setAutoSaveData, getAutoSaveData } = useFormStateManager();
  const lastSavedDataRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const statusRef = useRef<AutoSaveStatus>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveError: null
  });

  // Debounced save function
  const debouncedSave = useCallback(
    FormUtils.debounce(async (data: Record<string, any>) => {
      if (!enabled) return;

      const currentDataString = JSON.stringify(data);
      
      // Skip if data hasn't changed
      if (currentDataString === lastSavedDataRef.current) {
        return;
      }

      statusRef.current = {
        ...statusRef.current,
        isSaving: true,
        saveError: null
      };

      try {
        // Save to local storage via state manager
        setAutoSaveData(formKey, data);
        
        // Call custom save handler if provided
        if (onSave) {
          await onSave(data);
        }

        lastSavedDataRef.current = currentDataString;
        statusRef.current = {
          ...statusRef.current,
          isSaving: false,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
          saveError: null
        };
      } catch (error) {
        const saveError = error instanceof Error ? error : new Error('Auto-save failed');
        
        statusRef.current = {
          ...statusRef.current,
          isSaving: false,
          saveError
        };

        if (onSaveError) {
          onSaveError(saveError);
        }
      }
    }, 2000), // 2 second debounce
    [enabled, formKey, setAutoSaveData, onSave, onSaveError]
  );

  // Periodic save function
  const periodicSave = useCallback(() => {
    if (!enabled || Object.keys(formData).length === 0) return;

    const currentDataString = JSON.stringify(formData);
    const hasChanges = currentDataString !== lastSavedDataRef.current;

    if (hasChanges) {
      statusRef.current = {
        ...statusRef.current,
        hasUnsavedChanges: true
      };
      
      debouncedSave(formData);
    }
  }, [enabled, formData, debouncedSave]);

  // Set up periodic save
  useEffect(() => {
    if (!enabled) return;

    saveTimeoutRef.current = setInterval(periodicSave, saveInterval);

    return () => {
      if (saveTimeoutRef.current) {
        clearInterval(saveTimeoutRef.current);
      }
    };
  }, [enabled, saveInterval, periodicSave]);

  // Save on form data changes
  useEffect(() => {
    if (enabled && Object.keys(formData).length > 0) {
      debouncedSave(formData);
    }
  }, [formData, enabled, debouncedSave]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (!enabled) return;

    await debouncedSave(formData);
  }, [enabled, formData, debouncedSave]);

  // Get saved data
  const getSavedData = useCallback(() => {
    return getAutoSaveData(formKey);
  }, [formKey, getAutoSaveData]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    const { clearAutoSaveData } = useFormStateManager.getState();
    clearAutoSaveData(formKey);
    lastSavedDataRef.current = '';
    
    statusRef.current = {
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: false,
      saveError: null
    };
  }, [formKey]);

  return {
    saveNow,
    getSavedData,
    clearSavedData,
    status: statusRef.current
  };
}
```

### 2. Smart Defaults Provider
- [ ] Create: `src/common/forms/SmartDefaultsProvider.tsx` (under 150 lines)

```tsx
// src/common/forms/SmartDefaultsProvider.tsx
'use client';

import { createContext, useContext, useCallback, useMemo } from 'react';
import { useAuth } from '@/common/hooks/useAuth';
import type { AttributeDefinitionWithOptions } from '@/types/attributes';
import type { ItemCreationRequest } from '@/types/item';

interface SmartDefaultsContextType {
  getDefaultValue: (attribute: AttributeDefinitionWithOptions) => any;
  getSmartSuggestions: (attribute: AttributeDefinitionWithOptions, currentValue?: any) => string[];
  generateSmartDefaults: (attributes: AttributeDefinitionWithOptions[]) => Record<string, any>;
}

const SmartDefaultsContext = createContext<SmartDefaultsContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export function SmartDefaultsProvider({ children }: Props) {
  const { user } = useAuth();

  // Get default value for an attribute
  const getDefaultValue = useCallback((attribute: AttributeDefinitionWithOptions): any => {
    // Use explicit default value if set
    if (attribute.default_value) {
      return attribute.default_value;
    }

    // Smart defaults based on attribute name and type
    switch (attribute.name.toLowerCase()) {
      case 'location':
        return user?.location || '';
      
      case 'condition':
        return 'good'; // Most common condition
        
      case 'is_available':
        return true;
        
      case 'is_public':
        return true;
        
      case 'is_shareable':
        return true;

      case 'brand':
        // Could return popular brands based on category
        return '';

      case 'color':
        return '';

      case 'size':
        return attribute.data_type === 'select' ? '' : 'Medium';

      default:
        // Type-based defaults
        switch (attribute.data_type) {
          case 'boolean':
            return false;
          case 'number':
            return attribute.validation_rules?.min_value || 0;
          case 'multi_select':
            return [];
          case 'date':
            return '';
          default:
            return '';
        }
    }
  }, [user]);

  // Get smart suggestions for an attribute
  const getSmartSuggestions = useCallback((
    attribute: AttributeDefinitionWithOptions, 
    currentValue?: any
  ): string[] => {
    const suggestions: string[] = [];

    // Category-specific suggestions
    switch (attribute.name.toLowerCase()) {
      case 'brand':
        // Return popular brands (would come from analytics in real app)
        suggestions.push('DeWalt', 'Makita', 'Milwaukee', 'Bosch', 'Black & Decker');
        break;

      case 'color':
        suggestions.push('Black', 'White', 'Silver', 'Red', 'Blue', 'Green');
        break;

      case 'material':
        suggestions.push('Steel', 'Aluminum', 'Plastic', 'Wood', 'Composite');
        break;

      case 'power_source':
        suggestions.push('Electric', 'Battery', 'Gas', 'Manual', 'Pneumatic');
        break;

      case 'warranty':
        suggestions.push('1 year', '2 years', '3 years', '5 years', 'Lifetime');
        break;

      case 'tags':
        // Context-aware tag suggestions
        if (typeof currentValue === 'string' && currentValue.includes('power')) {
          suggestions.push('power tools', 'construction', 'DIY', 'professional');
        } else {
          suggestions.push('tools', 'equipment', 'hardware', 'accessories');
        }
        break;
    }

    // Text field suggestions based on validation rules
    if (attribute.data_type === 'text' && attribute.validation_rules?.pattern) {
      // Could provide format examples based on regex pattern
      const pattern = attribute.validation_rules.pattern;
      if (pattern.includes('\\d{4}')) {
        suggestions.push('Example: 2024');
      }
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }, []);

  // Generate smart defaults for all attributes
  const generateSmartDefaults = useCallback((
    attributes: AttributeDefinitionWithOptions[]
  ): Record<string, any> => {
    const defaults: Record<string, any> = {};

    attributes.forEach(attr => {
      const defaultValue = getDefaultValue(attr);
      if (defaultValue !== '' && defaultValue !== null) {
        defaults[attr.name] = defaultValue;
      }
    });

    return defaults;
  }, [getDefaultValue]);

  const contextValue = useMemo(() => ({
    getDefaultValue,
    getSmartSuggestions,
    generateSmartDefaults
  }), [getDefaultValue, getSmartSuggestions, generateSmartDefaults]);

  return (
    <SmartDefaultsContext.Provider value={contextValue}>
      {children}
    </SmartDefaultsContext.Provider>
  );
}

export function useSmartDefaults() {
  const context = useContext(SmartDefaultsContext);
  if (!context) {
    throw new Error('useSmartDefaults must be used within SmartDefaultsProvider');
  }
  return context;
}
```

### 3. Field Suggestions Component
- [ ] Create: `src/common/forms/FieldSuggestions.tsx` (under 150 lines)

```tsx
// src/common/forms/FieldSuggestions.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/primitives/button';
import { Badge } from '@/primitives/badge';
import { LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSmartDefaults } from './SmartDefaultsProvider';
import type { AttributeDefinitionWithOptions } from '@/types/attributes';

interface Props {
  attribute: AttributeDefinitionWithOptions;
  currentValue?: any;
  onSuggestionSelect: (suggestion: string) => void;
  onDismiss?: () => void;
  maxSuggestions?: number;
}

export function FieldSuggestions({ 
  attribute, 
  currentValue, 
  onSuggestionSelect, 
  onDismiss,
  maxSuggestions = 5 
}: Props) {
  const { getSmartSuggestions } = useSmartDefaults();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSuggestions = async () => {
      const smartSuggestions = getSmartSuggestions(attribute, currentValue);
      setSuggestions(smartSuggestions.slice(0, maxSuggestions));
      
      // Show suggestions if we have them and field is empty or partially filled
      const shouldShow = smartSuggestions.length > 0 && 
                        !dismissed && 
                        (!currentValue || 
                         (typeof currentValue === 'string' && currentValue.length < 3));
      
      setIsVisible(shouldShow);
    };

    loadSuggestions();
  }, [attribute, currentValue, getSmartSuggestions, maxSuggestions, dismissed]);

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <LightBulbIcon className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-900">
            Suggestions for {attribute.display_label}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600 p-0.5"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              size="sm"
              variant="outline"
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs bg-white hover:bg-blue-100 border-blue-300"
            >
              {suggestion}
            </Button>
          ))}
        </div>
        
        <p className="text-xs text-blue-700">
          💡 Click a suggestion to use it, or continue typing your own value
        </p>
      </div>
    </div>
  );
}
```

### 4. Form Tour Component
- [ ] Create: `src/common/forms/FormTour.tsx` (under 150 lines)

```tsx
// src/common/forms/FormTour.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/primitives/dialog';
import { Button } from '@/primitives/button';
import { Badge } from '@/primitives/badge';
import { 
  QuestionMarkCircleIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'highlight' | 'click' | 'type';
}

interface Props {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  showOnFirstVisit?: boolean;
}

export function FormTour({ steps, isOpen, onClose, onComplete, showOnFirstVisit = true }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const tourKey = 'form-tour-seen';
    const seen = localStorage.getItem(tourKey) === 'true';
    setHasSeenTour(seen);
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('form-tour-seen', 'true');
    setHasSeenTour(true);
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('form-tour-seen', 'true');
    setHasSeenTour(true);
    onClose();
  };

  const currentStepData = steps[currentStep];

  if (!isOpen || (showOnFirstVisit && hasSeenTour)) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Tour Dialog */}
      <Dialog open={isOpen} onClose={onClose} size="md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <QuestionMarkCircleIcon className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-900">Form Guide</span>
              <Badge variant="secondary">
                {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {currentStepData && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {currentStepData.content}
              </p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <div>
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleSkip}
              >
                Skip Tour
              </Button>
              
              <Button
                onClick={handleNext}
                rightIcon={
                  currentStep < steps.length - 1 
                    ? <ChevronRightIcon className="h-4 w-4" />
                    : undefined
                }
              >
                {currentStep < steps.length - 1 ? 'Next' : 'Complete'}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

// Default tour steps for dynamic forms
export const DEFAULT_FORM_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Dynamic Forms',
    content: 'This form adapts based on your item category. We\'ll guide you through the process step by step.'
  },
  {
    id: 'category',
    title: 'Choose Your Category',
    content: 'Start by selecting the category that best describes your item. This determines what additional fields you\'ll see.',
    target: '[data-tour="category-selector"]'
  },
  {
    id: 'required-fields',
    title: 'Required vs Optional Fields',
    content: 'Fields marked with a red asterisk (*) are required. Optional fields help others find and understand your item better.'
  },
  {
    id: 'suggestions',
    title: 'Smart Suggestions',
    content: 'Look for the lightbulb icon! We provide helpful suggestions based on your selections to save you time.',
    target: '[data-tour="suggestions"]'
  },
  {
    id: 'auto-save',
    title: 'Auto-Save Feature',
    content: 'Don\'t worry about losing your progress. We automatically save your work as you type, so you can come back anytime.'
  },
  {
    id: 'validation',
    title: 'Real-Time Validation',
    content: 'We check your input as you type and provide immediate feedback to help you complete the form correctly.'
  }
];
```

### 5. Mobile Responsive Enhancements
- [ ] Create: `src/common/forms/MobileFormEnhancements.tsx` (under 150 lines)

```tsx
// src/common/forms/MobileFormEnhancements.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/primitives/button';
import { ChevronUpIcon, ChevronDownIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

interface Props {
  children: React.ReactNode;
  totalFields: number;
  completedFields: number;
  isFormValid: boolean;
  onSubmit: () => void;
  submitText?: string;
}

export function MobileFormEnhancements({ 
  children, 
  totalFields, 
  completedFields, 
  isFormValid, 
  onSubmit,
  submitText = 'Submit' 
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show floating button when scrolled past 50% of form
      setShowFloatingButton(scrollY > windowHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  if (!isMobile) {
    return <>{children}</>;
  }

  const progress = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="mobile-form-container">
      {/* Mobile Progress Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DevicePhoneMobileIcon className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                Form Progress
              </div>
              <div className="text-xs text-gray-500">
                {completedFields} of {totalFields} fields
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-gray-900">
              {progress}%
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              {isCollapsed ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronUpIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        {!isCollapsed && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Form Content */}
      <div className="pb-20"> {/* Extra padding for floating button */}
        {children}
      </div>

      {/* Floating Submit Button */}
      {showFloatingButton && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <Button
            onClick={onSubmit}
            disabled={!isFormValid}
            className="w-full py-4 text-lg font-medium shadow-lg"
            size="lg"
          >
            {submitText}
            {completedFields < totalFields && (
              <span className="ml-2 text-sm opacity-75">
                ({totalFields - completedFields} fields remaining)
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Mobile-Optimized Field Spacing */}
      <style jsx>{`
        .mobile-form-container .space-y-6 > * + * {
          margin-top: 1.5rem;
        }
        
        .mobile-form-container .grid {
          display: block;
        }
        
        .mobile-form-container .grid > * + * {
          margin-top: 1rem;
        }
        
        .mobile-form-container input,
        .mobile-form-container textarea,
        .mobile-form-container select {
          min-height: 44px; /* iOS recommended touch target */
          font-size: 16px; /* Prevent zoom on iOS */
        }
        
        .mobile-form-container .form-field {
          padding: 0.75rem;
        }
        
        @media (max-width: 640px) {
          .mobile-form-container .text-sm {
            font-size: 0.875rem;
          }
          
          .mobile-form-container .text-xs {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
```

## Success Criteria
- [ ] Auto-save functionality preserves user progress automatically
- [ ] Smart defaults and suggestions improve form completion speed
- [ ] Field suggestions help users with common values
- [ ] Form tour guides new users through the process
- [ ] Mobile-responsive design with touch-friendly controls
- [ ] Floating action buttons for better mobile UX
- [ ] All files under 150 lines with proper imports 