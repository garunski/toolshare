# Phase 10: Enforce File Size Limits and Quality Standards

## 🎯 Objective
Configure ESLint rules and plugins to enforce file size limits, component organization, and quality standards automatically through the existing linting infrastructure.

## 📊 Current State Analysis

### Problem
- **Files exceeding size limits** (pages over 150 lines, API routes over 100 lines)
- **Inconsistent component organization** (not following named folder with index.tsx pattern)
- **Business logic extraction without clear purpose** (violating reuse + meaning principle)
- **Validation schemas not properly shared** between client and server
- **Inconsistent naming conventions** across the codebase
- **No automated enforcement** of architectural standards

### Impact
- **Difficult maintenance** due to oversized files
- **Poor code organization** making it hard to navigate
- **Unnecessary complexity** from premature abstractions
- **Inconsistent validation** between client and server
- **Reduced code quality** and developer experience
- **Violation of architectural principles** established in rules

## 🚀 Step-by-Step Implementation

### Step 1: Install ESLint Plugins for File Size and Complexity
Install plugins to enforce file size limits and complexity:

```bash
npm install --save-dev eslint-plugin-import eslint-plugin-sonarjs eslint-plugin-unicorn
```

### Step 2: Configure ESLint Rules for File Size Limits
Update ESLint configuration to enforce file size limits:

```javascript
// eslint.config.mjs
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
      sonarjs: sonarjs,
      unicorn: unicorn,
    },
    rules: {
      // File size and complexity rules
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'complexity': ['error', 10],
      'max-depth': ['error', 4],
      'max-params': ['error', 4],
      
      // Component organization rules
      'import/no-default-export': 'off', // Allow default exports for pages
      'import/prefer-default-export': 'off',
      'import/no-named-default': 'error',
      
      // Naming conventions
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
          },
          ignore: [
            'page.tsx',
            'layout.tsx',
            'route.ts',
            'middleware.ts',
            'index.tsx',
            'index.ts',
          ],
        },
      ],
      
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      
      // Code quality rules
      'sonarjs/cognitive-complexity': ['error', 10],
      'sonarjs/no-duplicate-string': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      
      // Import organization
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    // Specific rules for API routes (stricter limits)
    files: ['**/api/**/*.ts', '**/route.ts'],
    rules: {
      'max-lines': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
      'complexity': ['error', 5],
    },
  },
  {
    // Specific rules for page components
    files: ['**/page.tsx'],
    rules: {
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'complexity': ['error', 8],
    },
  },
  {
    // Specific rules for business logic files
    files: ['**/perform*.ts', '**/get*.ts', '**/validate*.ts'],
    rules: {
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
      'complexity': ['error', 15],
    },
  },
];
```

### Step 3: Create Custom ESLint Rules for Component Organization
Create custom ESLint rules to enforce component organization patterns:

```javascript
// eslint-rules/component-organization.js
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce component organization patterns',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.getFilename();
        
        // Check if component file is in a named folder
        if (filename.includes('/components/') && !filename.includes('/index.tsx')) {
          const componentName = filename.split('/').pop().replace('.tsx', '');
          const folderName = filename.split('/').slice(-2, -1)[0];
          
          if (componentName !== folderName) {
            context.report({
              node,
              message: `Component ${componentName} should be in a folder named ${componentName} with index.tsx`,
            });
          }
        }
        
        // Check for missing index.tsx in component folders
        if (filename.includes('/components/') && filename.endsWith('/index.tsx')) {
          const folderName = filename.split('/').slice(-2, -1)[0];
          const hasNamedExport = node.body.some(
            (stmt) => stmt.type === 'ExportNamedDeclaration'
          );
          
          if (!hasNamedExport) {
            context.report({
              node,
              message: `Component folder ${folderName} should have a named export in index.tsx`,
            });
          }
        }
      },
    };
  },
};
```

### Step 4: Configure ESLint for Validation Schema Sharing
Add rules to encourage shared validation schemas:

```javascript
// Add to eslint.config.mjs
{
  // Rules for validation files
  files: ['**/validation/**/*.ts'],
  rules: {
    'import/no-default-export': 'error', // Force named exports for schemas
    'import/prefer-named-export': 'error',
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true,
        },
        ignore: ['schema.ts', 'validate*.ts'],
      },
    ],
  },
},
```

### Step 5: Add Business Logic Extraction Rules
Configure rules to prevent meaningless business logic extraction:

```javascript
// Add to eslint.config.mjs
{
  // Rules for business logic files
  files: ['**/perform*.ts', '**/get*.ts'],
  rules: {
    'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
    'complexity': ['error', 15],
    'sonarjs/cognitive-complexity': ['error', 15],
    // Prevent single-line functions that just call another function
    'sonarjs/no-redundant-boolean': 'error',
    'sonarjs/prefer-immediate-return': 'error',
  },
},
```

### Step 6: Create ESLint Scripts in Package.json
Add ESLint scripts for different quality checks:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "lint:api": "eslint src/app/api --ext .ts,.tsx",
    "lint:pages": "eslint src/app --ext .tsx --config eslint.config.mjs",
    "lint:components": "eslint src/app --ext .tsx --config eslint.config.mjs",
    "lint:strict": "eslint . --ext .ts,.tsx --max-warnings 0"
  }
}
```

### Step 7: Configure Pre-commit Hooks
Set up pre-commit hooks to run ESLint automatically:

```json
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint:strict
```

### Step 8: Create ESLint Ignore Patterns
Configure `.eslintignore` for files that shouldn't be linted:

```text
# .eslintignore
node_modules/
.next/
out/
build/
dist/
*.config.js
*.config.mjs
```

### Step 9: Add TypeScript Path Mapping Validation
Create ESLint rule to validate import paths:

```javascript
// Add to eslint.config.mjs
{
  rules: {
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
    // Prevent deep relative imports
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../../../*'],
            message: 'Use absolute imports instead of deep relative imports',
          },
        ],
      },
    ],
  },
},
```

### Step 10: Configure IDE Integration
Ensure ESLint works properly in IDEs:

```json
// .vscode/settings.json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.workingDirectories": ["."],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## ✅ Verification Checklist

- [ ] ESLint plugins installed (import, sonarjs, unicorn)
- [ ] File size limits configured in ESLint rules
- [ ] Component organization rules implemented
- [ ] Validation schema sharing rules configured
- [ ] Business logic extraction rules added
- [ ] Custom ESLint rules created for component organization
- [ ] Package.json scripts updated for different lint targets
- [ ] Pre-commit hooks configured
- [ ] ESLint ignore patterns set up
- [ ] TypeScript path mapping validation added
- [ ] IDE integration configured
- [ ] All existing code passes ESLint rules

## 🎯 Success Criteria

- ✅ ESLint enforces file size limits automatically
- ✅ Component organization patterns enforced through linting
- ✅ Business logic extraction follows reuse + meaning principle
- ✅ Validation schemas properly shared between client/server
- ✅ Consistent naming conventions enforced
- ✅ High code quality maintained through automated checks
- ✅ No custom scripts needed - using industry-standard tools

## ⚠️ Common Issues and Solutions

### Issue: ESLint rules too strict for existing code
**Solution:** Gradually increase rule strictness or use `--fix` to auto-fix issues where possible.

### Issue: Custom rules not working
**Solution:** Ensure custom rules are properly registered in ESLint configuration and test with specific files.

### Issue: Performance issues with ESLint
**Solution:** Use `.eslintignore` to exclude unnecessary files and configure caching.

### Issue: IDE not showing ESLint errors
**Solution:** Install ESLint extension and configure workspace settings properly.

## 📚 Additional Resources

- [ESLint Configuration Guide](https://eslint.org/docs/latest/use/configure/)
- [ESLint Plugin Development](https://eslint.org/docs/latest/extend/plugins)
- [SonarJS ESLint Plugin](https://github.com/SonarSource/eslint-plugin-sonarjs)
- [Unicorn ESLint Plugin](https://github.com/sindresorhus/eslint-plugin-unicorn)
- [Import ESLint Plugin](https://github.com/import-js/eslint-plugin-import)
