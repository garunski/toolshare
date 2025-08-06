import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FormState {
  // Auto-save functionality
  autoSaveData: Record<string, any>;
  autoSaveKey: string | null;
  
  // Form progress tracking
  formProgress: Record<string, {
    totalFields: number;
    completedFields: number;
    lastSaved: Date;
  }>;

  // Field validation cache
  validationCache: Record<string, {
    isValid: boolean;
    errors: string[];
    lastValidated: Date;
  }>;

  // Actions
  setAutoSaveData: (key: string, data: any) => void;
  getAutoSaveData: (key: string) => any;
  clearAutoSaveData: (key: string) => void;
  
  updateFormProgress: (formId: string, total: number, completed: number) => void;
  getFormProgress: (formId: string) => { totalFields: number; completedFields: number; lastSaved: Date } | null;
  
  cacheValidation: (fieldKey: string, isValid: boolean, errors: string[]) => void;
  getValidationCache: (fieldKey: string) => { isValid: boolean; errors: string[] } | null;
  clearValidationCache: (fieldKey: string) => void;
}

export const useFormStateManager = create<FormState>()(
  persist(
    (set, get) => ({
      autoSaveData: {},
      autoSaveKey: null,
      formProgress: {},
      validationCache: {},

      setAutoSaveData: (key: string, data: any) => {
        set(state => ({
          autoSaveData: {
            ...state.autoSaveData,
            [key]: {
              ...data,
              savedAt: new Date().toISOString()
            }
          },
          autoSaveKey: key
        }));
      },

      getAutoSaveData: (key: string) => {
        const data = get().autoSaveData[key];
        if (!data) return null;
        
        // Check if data is too old (24 hours)
        const savedAt = new Date(data.savedAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          get().clearAutoSaveData(key);
          return null;
        }
        
        return data;
      },

      clearAutoSaveData: (key: string) => {
        set(state => {
          const newAutoSaveData = { ...state.autoSaveData };
          delete newAutoSaveData[key];
          return {
            autoSaveData: newAutoSaveData,
            autoSaveKey: state.autoSaveKey === key ? null : state.autoSaveKey
          };
        });
      },

      updateFormProgress: (formId: string, total: number, completed: number) => {
        set(state => ({
          formProgress: {
            ...state.formProgress,
            [formId]: {
              totalFields: total,
              completedFields: completed,
              lastSaved: new Date()
            }
          }
        }));
      },

      getFormProgress: (formId: string) => {
        return get().formProgress[formId] || null;
      },

      cacheValidation: (fieldKey: string, isValid: boolean, errors: string[]) => {
        set(state => ({
          validationCache: {
            ...state.validationCache,
            [fieldKey]: {
              isValid,
              errors,
              lastValidated: new Date()
            }
          }
        }));
      },

      getValidationCache: (fieldKey: string) => {
        const cached = get().validationCache[fieldKey];
        if (!cached) return null;

        // Cache is valid for 5 minutes
        const minutesDiff = (new Date().getTime() - cached.lastValidated.getTime()) / (1000 * 60);
        if (minutesDiff > 5) {
          get().clearValidationCache(fieldKey);
          return null;
        }

        return { isValid: cached.isValid, errors: cached.errors };
      },

      clearValidationCache: (fieldKey: string) => {
        set(state => {
          const newValidationCache = { ...state.validationCache };
          delete newValidationCache[fieldKey];
          return { validationCache: newValidationCache };
        });
      }
    }),
    {
      name: 'form-state-storage',
      partialize: (state) => ({
        autoSaveData: state.autoSaveData,
        formProgress: state.formProgress
      })
    }
  )
);

// Form utilities
export class FormUtils {
  static generateFormKey(type: string, id?: string): string {
    return `${type}-${id || 'new'}-${Date.now()}`;
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  static calculateCompletionPercentage(
    totalFields: number,
    completedFields: number
  ): number {
    if (totalFields === 0) return 100;
    return Math.round((completedFields / totalFields) * 100);
  }

  static validateFieldValue(
    value: any,
    attribute: any
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (attribute.is_required && (!value || value === '')) {
      errors.push(`${attribute.display_label} is required`);
    }

    if (value && attribute.validation_rules) {
      const rules = attribute.validation_rules;

      switch (attribute.data_type) {
        case 'text':
        case 'email':
        case 'url':
          if (rules.min_length && String(value).length < rules.min_length) {
            errors.push(`Minimum length is ${rules.min_length} characters`);
          }
          if (rules.max_length && String(value).length > rules.max_length) {
            errors.push(`Maximum length is ${rules.max_length} characters`);
          }
          if (attribute.data_type === 'email' && !value.includes('@')) {
            errors.push('Please enter a valid email address');
          }
          if (attribute.data_type === 'url' && !value.startsWith('http')) {
            errors.push('Please enter a valid URL');
          }
          break;

        case 'number':
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors.push('Please enter a valid number');
          } else {
            if (rules.min_value !== undefined && numValue < rules.min_value) {
              errors.push(`Minimum value is ${rules.min_value}`);
            }
            if (rules.max_value !== undefined && numValue > rules.max_value) {
              errors.push(`Maximum value is ${rules.max_value}`);
            }
          }
          break;

        case 'multi_select':
          if (rules.min_selections && Array.isArray(value) && value.length < rules.min_selections) {
            errors.push(`Please select at least ${rules.min_selections} option${rules.min_selections > 1 ? 's' : ''}`);
          }
          if (rules.max_selections && Array.isArray(value) && value.length > rules.max_selections) {
            errors.push(`Please select no more than ${rules.max_selections} option${rules.max_selections > 1 ? 's' : ''}`);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 