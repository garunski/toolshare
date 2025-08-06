'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';

interface SmartDefault {
  field: string;
  value: any;
  confidence: number;
  source: 'history' | 'category' | 'user' | 'system';
  description?: string;
}

interface SmartDefaultsContextType {
  getDefaults: (categoryId?: number, userId?: string) => SmartDefault[];
  getSuggestions: (field: string, currentValue: any, categoryId?: number) => string[];
  getFieldHelp: (field: string, categoryId?: number) => string | null;
  getCommonValues: (field: string, categoryId?: number) => string[];
}

const SmartDefaultsContext = createContext<SmartDefaultsContextType | null>(null);

interface Props {
  children: ReactNode;
  userHistory?: Record<string, any[]>;
  categoryDefaults?: Record<number, Record<string, any>>;
  systemDefaults?: Record<string, any>;
}

export function SmartDefaultsProvider({ 
  children, 
  userHistory = {}, 
  categoryDefaults = {}, 
  systemDefaults = {} 
}: Props) {
  const contextValue = useMemo(() => {
    const getDefaults = (categoryId?: number, userId?: string): SmartDefault[] => {
      const defaults: SmartDefault[] = [];

      // System defaults
      Object.entries(systemDefaults).forEach(([field, value]) => {
        defaults.push({
          field,
          value,
          confidence: 0.3,
          source: 'system',
          description: 'System default value'
        });
      });

      // Category-specific defaults
      if (categoryId && categoryDefaults[categoryId]) {
        Object.entries(categoryDefaults[categoryId]).forEach(([field, value]) => {
          defaults.push({
            field,
            value,
            confidence: 0.7,
            source: 'category',
            description: 'Common value for this category'
          });
        });
      }

      // User history defaults
      if (userId && userHistory[userId]) {
        userHistory[userId].forEach((item, index) => {
          Object.entries(item).forEach(([field, value]) => {
            if (value && typeof value === 'string' && value.length > 0) {
              defaults.push({
                field,
                value,
                confidence: 0.5 + (index * 0.1), // More recent items have higher confidence
                source: 'history',
                description: `From your recent items`
              });
            }
          });
        });
      }

      return defaults.sort((a, b) => b.confidence - a.confidence);
    };

    const getSuggestions = (field: string, currentValue: any, categoryId?: number): string[] => {
      const suggestions: string[] = [];

      // Get common values for this field
      const commonValues = getCommonValues(field, categoryId);
      suggestions.push(...commonValues.filter(v => v !== currentValue));

      // Get user history values
      Object.values(userHistory).forEach(items => {
        items.forEach(item => {
          if (item[field] && typeof item[field] === 'string' && 
              item[field] !== currentValue && 
              !suggestions.includes(item[field])) {
            suggestions.push(item[field]);
          }
        });
      });

      return suggestions.slice(0, 5); // Limit to 5 suggestions
    };

    const getFieldHelp = (field: string, categoryId?: number): string | null => {
      const helpTexts: Record<string, string> = {
        name: 'Choose a descriptive name that clearly identifies your item',
        description: 'Provide detailed information about condition, features, and usage',
        condition: 'Be honest about the item\'s condition to build trust',
        location: 'General area is fine - exact address is not required',
        tags: 'Use relevant keywords to help others find your item',
        price: 'Consider the item\'s condition and market value',
        brand: 'Include brand name if applicable',
        model: 'Model number helps with identification',
        year: 'Year of manufacture if known',
        dimensions: 'Include length, width, height in inches or cm',
        weight: 'Weight in pounds or kilograms',
        power_source: 'Battery, electric, manual, etc.',
        warranty: 'Include warranty information if available'
      };

      return helpTexts[field] || null;
    };

    const getCommonValues = (field: string, categoryId?: number): string[] => {
      const commonValues: Record<string, string[]> = {
        condition: ['excellent', 'good', 'fair', 'like_new', 'new', 'poor'],
        power_source: ['electric', 'battery', 'manual', 'gas', 'solar'],
        location: ['Home', 'Garage', 'Basement', 'Storage Unit', 'Office'],
        brand: ['DeWalt', 'Milwaukee', 'Makita', 'Ryobi', 'Black+Decker', 'Craftsman'],
        tags: ['power tools', 'hand tools', 'garden', 'kitchen', 'electronics', 'sports']
      };

      return commonValues[field] || [];
    };

    return {
      getDefaults,
      getSuggestions,
      getFieldHelp,
      getCommonValues
    };
  }, [userHistory, categoryDefaults, systemDefaults]);

  return (
    <SmartDefaultsContext.Provider value={contextValue}>
      {children}
    </SmartDefaultsContext.Provider>
  );
}

export function useSmartDefaults() {
  const context = useContext(SmartDefaultsContext);
  if (!context) {
    throw new Error('useSmartDefaults must be used within a SmartDefaultsProvider');
  }
  return context;
} 