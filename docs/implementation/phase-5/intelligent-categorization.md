# Intelligent Categorization System

## AI-Assisted Product Categorization

### 1. Category Suggestion Engine
- [ ] Create: `src/common/operations/categorySuggestionEngine.ts` (under 150 lines)

```typescript
// src/common/operations/categorySuggestionEngine.ts
import { createClient } from '@/common/supabase/client';

interface CategorySuggestion {
  external_id: number;
  category_path: string;
  confidence: number;
  reasons: string[];
  level: number;
}

interface ProductContext {
  name: string;
  description?: string;
  attributes?: Record<string, any>;
  tags?: string[];
  existingCategory?: number;
}

export class CategorySuggestionEngine {
  
  /**
   * Get category suggestions for product
   */
  static async suggestCategories(context: ProductContext): Promise<CategorySuggestion[]> {
    const searchTerms = this.extractSearchTerms(context);
    const candidates = await this.findCandidateCategories(searchTerms);
    const scored = this.scoreCategories(candidates, context);
    
    return scored
      .filter(suggestion => suggestion.confidence > 30)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * Extract search terms from product context
   */
  private static extractSearchTerms(context: ProductContext): string[] {
    const terms: string[] = [];
    
    // Extract from name
    if (context.name) {
      terms.push(...context.name.toLowerCase().split(/\s+/));
    }
    
    // Extract from description
    if (context.description) {
      const descWords = context.description.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
      terms.push(...descWords);
    }
    
    // Extract from tags
    if (context.tags) {
      terms.push(...context.tags.map(tag => tag.toLowerCase()));
    }
    
    // Extract from attributes
    if (context.attributes) {
      Object.values(context.attributes).forEach(value => {
        if (typeof value === 'string') {
          terms.push(...value.toLowerCase().split(/\s+/));
        }
      });
    }
    
    // Remove duplicates and common words
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return [...new Set(terms)].filter(term => term.length > 2 && !stopWords.has(term));
  }

  /**
   * Find candidate categories using text search
   */
  private static async findCandidateCategories(searchTerms: string[]): Promise<any[]> {
    if (searchTerms.length === 0) return [];
    
    const supabase = createClient();
    const searchQuery = searchTerms.join(' | ');
    
    const { data: categories } = await supabase
      .from('external_product_taxonomy')
      .select('*')
      .textSearch('category_path', searchQuery)
      .eq('is_active', true)
      .limit(20);
    
    return categories || [];
  }

  /**
   * Score categories based on relevance
   */
  private static scoreCategories(candidates: any[], context: ProductContext): CategorySuggestion[] {
    return candidates.map(category => {
      const suggestion: CategorySuggestion = {
        external_id: category.external_id,
        category_path: category.category_path,
        confidence: 0,
        reasons: [],
        level: category.level
      };
      
      const pathLower = category.category_path.toLowerCase();
      const nameLower = context.name.toLowerCase();
      const descLower = context.description?.toLowerCase() || '';
      
      // Direct name matches
      if (pathLower.includes(nameLower)) {
        suggestion.confidence += 40;
        suggestion.reasons.push('Product name matches category path');
      }
      
      // Word overlap scoring
      const nameWords = nameLower.split(/\s+/);
      const pathWords = pathLower.split(/[>\s]+/);
      const commonWords = nameWords.filter(word => pathWords.includes(word));
      
      if (commonWords.length > 0) {
        const overlap = (commonWords.length / nameWords.length) * 30;
        suggestion.confidence += overlap;
        suggestion.reasons.push(`${commonWords.length} matching keywords`);
      }
      
      // Description relevance
      if (descLower) {
        const descWords = descLower.split(/\s+/);
        const descMatches = descWords.filter(word => pathWords.includes(word));
        if (descMatches.length > 0) {
          suggestion.confidence += (descMatches.length / descWords.length) * 20;
          suggestion.reasons.push('Description keywords match');
        }
      }
      
      // Category depth preference (more specific is better)
      suggestion.confidence += Math.min(category.level * 5, 15);
      
      // Existing category bonus
      if (context.existingCategory === category.external_id) {
        suggestion.confidence += 25;
        suggestion.reasons.push('Currently assigned category');
      }
      
      return suggestion;
    });
  }

  /**
   * Auto-categorize based on highest confidence
   */
  static async autoCategorize(context: ProductContext): Promise<{
    suggested: CategorySuggestion | null;
    requiresReview: boolean;
    alternatives: CategorySuggestion[];
  }> {
    const suggestions = await this.suggestCategories(context);
    
    if (suggestions.length === 0) {
      return { suggested: null, requiresReview: true, alternatives: [] };
    }
    
    const best = suggestions[0];
    const requiresReview = best.confidence < 70;
    const alternatives = suggestions.slice(1);
    
    return { suggested: best, requiresReview, alternatives };
  }
}
```

### 2. Machine Learning Category Predictor
- [ ] Create: `src/common/operations/categoryPredictor.ts` (under 150 lines)

```typescript
// src/common/operations/categoryPredictor.ts
import { createClient } from '@/common/supabase/client';

interface TrainingData {
  itemName: string;
  itemDescription: string;
  correctCategoryId: number;
  categoryPath: string;
  attributes: Record<string, any>;
}

interface PredictionModel {
  keywordWeights: Map<string, Map<number, number>>;
  categoryFrequency: Map<number, number>;
  totalSamples: number;
}

export class CategoryPredictor {
  private static model: PredictionModel | null = null;

  /**
   * Train model from existing categorized items
   */
  static async trainModel(): Promise<{ success: boolean; trainingSize: number; accuracy?: number }> {
    try {
      const trainingData = await this.getTrainingData();
      
      if (trainingData.length < 10) {
        return { success: false, trainingSize: 0 };
      }
      
      this.model = this.buildModel(trainingData);
      
      // Simple accuracy test on subset
      const testSize = Math.min(50, Math.floor(trainingData.length * 0.2));
      const testData = trainingData.slice(-testSize);
      const accuracy = await this.calculateAccuracy(testData);
      
      return { success: true, trainingSize: trainingData.length, accuracy };
    } catch (error) {
      console.error('Model training failed:', error);
      return { success: false, trainingSize: 0 };
    }
  }

  /**
   * Get training data from existing items
   */
  private static async getTrainingData(): Promise<TrainingData[]> {
    const supabase = createClient();
    const { data: items } = await supabase
      .from('items')
      .select(`
        name,
        description,
        external_category_id,
        attributes,
        external_product_taxonomy:external_category_id (
          category_path
        )
      `)
      .not('external_category_id', 'is', null)
      .not('name', 'is', null);
    
    if (!items) return [];
    
    return items
      .filter(item => item.external_product_taxonomy)
      .map(item => ({
        itemName: item.name,
        itemDescription: item.description || '',
        correctCategoryId: item.external_category_id,
        categoryPath: item.external_product_taxonomy.category_path,
        attributes: item.attributes || {}
      }));
  }

  /**
   * Build prediction model from training data
   */
  private static buildModel(trainingData: TrainingData[]): PredictionModel {
    const keywordWeights = new Map<string, Map<number, number>>();
    const categoryFrequency = new Map<number, number>();
    
    trainingData.forEach(sample => {
      // Count category frequency
      const count = categoryFrequency.get(sample.correctCategoryId) || 0;
      categoryFrequency.set(sample.correctCategoryId, count + 1);
      
      // Extract and weight keywords
      const keywords = this.extractKeywords(sample.itemName + ' ' + sample.itemDescription);
      
      keywords.forEach(keyword => {
        if (!keywordWeights.has(keyword)) {
          keywordWeights.set(keyword, new Map());
        }
        
        const categoryWeights = keywordWeights.get(keyword)!;
        const weight = categoryWeights.get(sample.correctCategoryId) || 0;
        categoryWeights.set(sample.correctCategoryId, weight + 1);
      });
    });
    
    // Normalize weights
    keywordWeights.forEach((categoryWeights, keyword) => {
      const total = Array.from(categoryWeights.values()).reduce((sum, weight) => sum + weight, 0);
      categoryWeights.forEach((weight, categoryId) => {
        categoryWeights.set(categoryId, weight / total);
      });
    });
    
    return {
      keywordWeights,
      categoryFrequency,
      totalSamples: trainingData.length
    };
  }

  /**
   * Predict category for new item
   */
  static async predictCategory(itemName: string, itemDescription?: string): Promise<{
    categoryId: number;
    confidence: number;
    reasoning: string[];
  } | null> {
    if (!this.model) {
      await this.trainModel();
    }
    
    if (!this.model) return null;
    
    const keywords = this.extractKeywords(itemName + ' ' + (itemDescription || ''));
    const scores = new Map<number, { score: number; reasons: string[] }>();
    
    keywords.forEach(keyword => {
      const categoryWeights = this.model!.keywordWeights.get(keyword);
      if (!categoryWeights) return;
      
      categoryWeights.forEach((weight, categoryId) => {
        const current = scores.get(categoryId) || { score: 0, reasons: [] };
        current.score += weight;
        current.reasons.push(`Keyword "${keyword}" (${Math.round(weight * 100)}%)`);
        scores.set(categoryId, current);
      });
    });
    
    if (scores.size === 0) return null;
    
    // Get best prediction
    const best = Array.from(scores.entries()).reduce((max, [categoryId, data]) => 
      data.score > max.score ? { categoryId, ...data } : max
    );
    
    return {
      categoryId: best.categoryId,
      confidence: Math.min(best.score * 100, 95),
      reasoning: best.reasons.slice(0, 3)
    };
  }

  /**
   * Extract relevant keywords
   */
  private static extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'for', 'with', 'this', 'that'].includes(word));
  }

  /**
   * Calculate model accuracy on test data
   */
  private static async calculateAccuracy(testData: TrainingData[]): Promise<number> {
    if (!this.model) return 0;
    
    let correct = 0;
    
    for (const sample of testData) {
      const prediction = await this.predictCategory(sample.itemName, sample.itemDescription);
      if (prediction && prediction.categoryId === sample.correctCategoryId) {
        correct++;
      }
    }
    
    return Math.round((correct / testData.length) * 100);
  }
}
```

### 3. Category Suggestion UI
- [ ] Create: `src/app/tools/add/components/CategorySuggestions.tsx` (under 150 lines)

```tsx
// src/app/tools/add/components/CategorySuggestions.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/primitives/button';
import { Badge } from '@/primitives/badge';
import { Card } from '@/primitives/card';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { CategorySuggestionEngine } from '@/common/operations/categorySuggestionEngine';
import type { CategorySuggestion } from '@/common/operations/categorySuggestionEngine';

interface Props {
  itemName: string;
  itemDescription?: string;
  attributes?: Record<string, any>;
  tags?: string[];
  onCategorySelect: (categoryId: number) => void;
  selectedCategoryId?: number | null;
}

export function CategorySuggestions({
  itemName,
  itemDescription,
  attributes,
  tags,
  onCategorySelect,
  selectedCategoryId
}: Props) {
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);

  useEffect(() => {
    if (!itemName.trim()) {
      setSuggestions([]);
      return;
    }

    const getSuggestions = async () => {
      setLoading(true);
      try {
        const result = await CategorySuggestionEngine.suggestCategories({
          name: itemName,
          description: itemDescription,
          attributes,
          tags,
          existingCategory: selectedCategoryId || undefined
        });
        
        setSuggestions(result);
        
        // Auto-select if high confidence and no current selection
        if (!selectedCategoryId && result.length > 0 && result[0].confidence > 80) {
          onCategorySelect(result[0].external_id);
          setAutoSelected(true);
        }
      } catch (error) {
        console.error('Failed to get category suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(getSuggestions, 500);
    return () => clearTimeout(debounceTimer);
  }, [itemName, itemDescription, attributes, tags, selectedCategoryId, onCategorySelect]);

  if (!itemName.trim()) {
    return (
      <Card className="p-4 bg-gray-50">
        <p className="text-gray-500 text-sm text-center">
          Enter an item name to see category suggestions
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-blue-500 animate-pulse" />
          <span className="text-sm font-medium">Finding best categories...</span>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="p-4 bg-yellow-50 border border-yellow-200">
        <p className="text-yellow-800 text-sm">
          No category suggestions found. Try adding more details or browse categories manually.
        </p>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-blue-600 bg-blue-100';
    if (confidence >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <SparklesIcon className="h-5 w-5 text-blue-500" />
        <span className="text-sm font-medium">Suggested Categories</span>
        {autoSelected && (
          <Badge variant="success" size="sm">Auto-selected</Badge>
        )}
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion) => {
          const isSelected = selectedCategoryId === suggestion.external_id;
          
          return (
            <div
              key={suggestion.external_id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onCategorySelect(suggestion.external_id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {suggestion.category_path.split(' > ').pop()}
                    </h4>
                    {isSelected && <CheckCircleIcon className="h-4 w-4 text-blue-500" />}
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">
                    {suggestion.category_path}
                  </p>
                  
                  {suggestion.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {suggestion.reasons.slice(0, 2).map((reason, index) => (
                        <Badge key={index} variant="outline" size="sm">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <Badge 
                  className={`ml-2 ${getConfidenceColor(suggestion.confidence)}`}
                  size="sm"
                >
                  {Math.round(suggestion.confidence)}%
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Suggestions based on item name, description, and existing categorizations
      </div>
    </Card>
  );
}
```

### 4. Implementation Checklist
- [ ] Category suggestion engine with intelligent scoring
- [ ] Machine learning predictor using existing data
- [ ] Auto-categorization with confidence thresholds
- [ ] Real-time suggestion UI component
- [ ] Training data collection from user interactions
- [ ] Model accuracy tracking and improvement
- [ ] Fallback strategies for edge cases
- [ ] Performance optimization for real-time suggestions
- [ ] Confidence calibration and validation
- [ ] User feedback integration for model improvement
- [ ] A/B testing for suggestion algorithms
- [ ] Caching for frequently suggested categories
- [ ] Analytics on suggestion acceptance rates
- [ ] Multi-language category matching support
- [ ] Attribute-based categorization enhancement 