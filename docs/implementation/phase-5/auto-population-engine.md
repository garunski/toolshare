# Auto-Population Engine

## Smart Defaults and Field Suggestions

### 1. Auto-Population Service
- [ ] Create: `src/common/operations/autoPopulationEngine.ts` (under 150 lines)

```typescript
// src/common/operations/autoPopulationEngine.ts
import { supabase } from '@/common/supabase';
import { AttributeMappingEngine } from './attributeMappingEngine';

interface AutoPopulationSuggestion {
  field: string;
  suggestedValue: any;
  confidence: number;
  source: 'pattern' | 'history' | 'category_default' | 'external_data';
  reasoning: string;
}

export class AutoPopulationEngine {
  
  /**
   * Get auto-population suggestions for item
   */
  static async getSuggestions(
    externalCategoryId: number,
    itemName: string,
    existingData: Record<string, any> = {}
  ): Promise<AutoPopulationSuggestion[]> {
    
    const suggestions: AutoPopulationSuggestion[] = [];
    
    // Get category mappings
    const mappings = await AttributeMappingEngine.getCategoryAttributeMappings(externalCategoryId);
    
    for (const mapping of mappings) {
      if (existingData[mapping.internal_field]) continue; // Skip if already filled
      
      const suggestion = await this.generateFieldSuggestion(mapping, itemName, existingData);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate suggestion for specific field
   */
  private static async generateFieldSuggestion(
    mapping: any,
    itemName: string,
    context: Record<string, any>
  ): Promise<AutoPopulationSuggestion | null> {
    
    const field = mapping.internal_field;
    
    // Pattern-based suggestions
    const patternSuggestion = this.getPatternBasedSuggestion(field, itemName);
    if (patternSuggestion) return patternSuggestion;
    
    // Historical data suggestions
    const historicalSuggestion = await this.getHistoricalSuggestion(field, itemName);
    if (historicalSuggestion) return historicalSuggestion;
    
    // Category default suggestions
    const defaultSuggestion = this.getCategoryDefaultSuggestion(field, mapping);
    if (defaultSuggestion) return defaultSuggestion;
    
    return null;
  }

  /**
   * Pattern-based suggestions from item name
   */
  private static getPatternBasedSuggestion(field: string, itemName: string): AutoPopulationSuggestion | null {
    const nameLower = itemName.toLowerCase();
    
    switch (field) {
      case 'brand':
        const brandPatterns = [
          { pattern: /\b(milwaukee|dewalt|makita|bosch|ryobi|black\+?decker|craftsman|porter.?cable)\b/i, confidence: 90 },
          { pattern: /\b(honda|yamaha|husqvarna|echo|stihl|toro)\b/i, confidence: 85 },
          { pattern: /\b(apple|samsung|lg|sony|panasonic|philips)\b/i, confidence: 95 }
        ];
        
        for (const { pattern, confidence } of brandPatterns) {
          const match = nameLower.match(pattern);
          if (match) {
            return {
              field,
              suggestedValue: match[1].replace(/\+/g, ' ').replace(/\./g, ' ').replace(/\s+/g, ' ').trim(),
              confidence,
              source: 'pattern',
              reasoning: `Brand detected in item name: "${match[1]}"`
            };
          }
        }
        break;
        
      case 'power_source':
        if (/\b(cordless|battery|rechargeable)\b/i.test(nameLower)) {
          return {
            field,
            suggestedValue: 'battery',
            confidence: 85,
            source: 'pattern',
            reasoning: 'Cordless/battery keywords detected in name'
          };
        }
        if (/\b(corded|electric|plug.?in)\b/i.test(nameLower)) {
          return {
            field,
            suggestedValue: 'electric',
            confidence: 80,
            source: 'pattern',
            reasoning: 'Electric/corded keywords detected in name'
          };
        }
        break;
        
      case 'condition':
        if (/\b(new|unused|mint)\b/i.test(nameLower)) {
          return {
            field,
            suggestedValue: 'excellent',
            confidence: 75,
            source: 'pattern',
            reasoning: 'New/unused condition keywords detected'
          };
        }
        break;
    }
    
    return null;
  }

  /**
   * Historical data-based suggestions
   */
  private static async getHistoricalSuggestion(field: string, itemName: string): Promise<AutoPopulationSuggestion | null> {
    // Find similar items
    const { data: similarItems } = await supabase
      .from('items')
      .select(`attributes`)
      .textSearch('name', itemName.split(' ').slice(0, 3).join(' & '))
      .not('attributes', 'is', null)
      .limit(10);
    
    if (!similarItems?.length) return null;
    
    // Extract field values from similar items
    const fieldValues: any[] = [];
    similarItems.forEach(item => {
      const value = item.attributes?.[field];
      if (value) fieldValues.push(value);
    });
    
    if (fieldValues.length === 0) return null;
    
    // Find most common value
    const valueCounts = new Map();
    fieldValues.forEach(value => {
      const count = valueCounts.get(value) || 0;
      valueCounts.set(value, count + 1);
    });
    
    const mostCommon = Array.from(valueCounts.entries())
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostCommon && mostCommon[1] >= 2) {
      return {
        field,
        suggestedValue: mostCommon[0],
        confidence: Math.min((mostCommon[1] / fieldValues.length) * 100, 70),
        source: 'history',
        reasoning: `Common value in ${mostCommon[1]} similar items`
      };
    }
    
    return null;
  }

  /**
   * Category default suggestions
   */
  private static getCategoryDefaultSuggestion(field: string, mapping: any): AutoPopulationSuggestion | null {
    if (!mapping.default_value) return null;
    
    return {
      field,
      suggestedValue: mapping.default_value,
      confidence: 60,
      source: 'category_default',
      reasoning: `Default value for this category`
    };
  }

  /**
   * Apply suggestions to form data
   */
  static applySuggestions(
    suggestions: AutoPopulationSuggestion[],
    currentData: Record<string, any>,
    confidenceThreshold = 80
  ): Record<string, any> {
    
    const enhanced = { ...currentData };
    
    suggestions.forEach(suggestion => {
      // Only auto-apply high confidence suggestions
      if (suggestion.confidence >= confidenceThreshold && !enhanced[suggestion.field]) {
        enhanced[suggestion.field] = suggestion.suggestedValue;
      }
    });
    
    return enhanced;
  }
}
```

### 2. Auto-Population UI Component
- [ ] Create: `src/app/tools/add/components/AutoPopulationSuggestions.tsx` (under 150 lines)

```tsx
// src/app/tools/add/components/AutoPopulationSuggestions.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/primitives/button';
import { Badge } from '@/primitives/badge';
import { Card } from '@/primitives/card';
import { LightBulbIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AutoPopulationEngine } from '@/common/operations/autoPopulationEngine';

interface Props {
  externalCategoryId: number;
  itemName: string;
  currentData: Record<string, any>;
  onApplySuggestion: (field: string, value: any) => void;
  onDismissSuggestion: (field: string) => void;
}

export function AutoPopulationSuggestions({
  externalCategoryId,
  itemName,
  currentData,
  onApplySuggestion,
  onDismissSuggestion
}: Props) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissedFields, setDismissedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!externalCategoryId || !itemName.trim()) {
      setSuggestions([]);
      return;
    }

    const getSuggestions = async () => {
      setLoading(true);
      try {
        const result = await AutoPopulationEngine.getSuggestions(
          externalCategoryId,
          itemName,
          currentData
        );
        
        // Filter out dismissed suggestions
        const filtered = result.filter(s => !dismissedFields.has(s.field));
        setSuggestions(filtered);
      } catch (error) {
        console.error('Failed to get auto-population suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(getSuggestions, 800);
    return () => clearTimeout(debounceTimer);
  }, [externalCategoryId, itemName, currentData, dismissedFields]);

  const handleApplySuggestion = (suggestion: any) => {
    onApplySuggestion(suggestion.field, suggestion.suggestedValue);
    // Remove from suggestions after applying
    setSuggestions(prev => prev.filter(s => s.field !== suggestion.field));
  };

  const handleDismissSuggestion = (suggestion: any) => {
    setDismissedFields(prev => new Set([...prev, suggestion.field]));
    onDismissSuggestion(suggestion.field);
  };

  if (loading || suggestions.length === 0) {
    return null; // Don't show empty state to avoid UI clutter
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <Card className="p-4 bg-blue-50 border border-blue-200">
      <div className="flex items-center space-x-2 mb-4">
        <LightBulbIcon className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">Smart Suggestions</span>
        <Badge variant="secondary" size="sm">{suggestions.length}</Badge>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.field}
            className="flex items-center justify-between p-3 bg-white rounded-lg border"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900 capitalize">
                  {suggestion.field.replace(/_/g, ' ')}
                </span>
                <Badge className={getConfidenceColor(suggestion.confidence)} size="sm">
                  {Math.round(suggestion.confidence)}%
                </Badge>
              </div>
              
              <p className="text-sm text-gray-700 mb-1">
                <strong>{suggestion.suggestedValue}</strong>
              </p>
              
              <p className="text-xs text-gray-500">
                {suggestion.reasoning}
              </p>
            </div>
            
            <div className="flex space-x-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApplySuggestion(suggestion)}
              >
                <CheckIcon className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismissSuggestion(suggestion)}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-600 text-center">
        Suggestions based on item name, category patterns, and similar items
      </div>
    </Card>
  );
}
```

### 3. Implementation Checklist
- [ ] Auto-population engine with intelligent field suggestions
- [ ] Pattern-based value extraction from item names
- [ ] Historical data analysis for common values
- [ ] Category-specific default value management
- [ ] Real-time suggestion UI with apply/dismiss actions
- [ ] Confidence scoring for suggestion reliability
- [ ] Performance optimization for suggestion generation
- [ ] User feedback integration for suggestion improvement
- [ ] Customizable suggestion rules per category
- [ ] Analytics on suggestion acceptance rates
- [ ] Integration with external data sources
- [ ] Smart defaults based on user behavior patterns
- [ ] Bulk suggestion application for efficiency
- [ ] Suggestion caching for performance
- [ ] A/B testing for suggestion algorithms 