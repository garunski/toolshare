# Phase 2: Data Model Foundation Overview

## Purpose
Implement the core database schema for external taxonomy integration, dynamic properties including Categories, Attribute Definitions, and enhanced Items table with JSONB support. This phase transforms the basic tool system into a professional item data collection system with comprehensive taxonomy and dynamic, category-specific properties.

## Critical Repository Rules
- **File Size Limit**: All files MUST be under 150 lines
- **Naming**: Use anti-generic naming conventions (specific, descriptive names)
- **Imports**: No deep relative imports (../../../) - use absolute paths via @/ alias
- **Commands**: Use `task` commands for all operations (`task dev:lint`, `task dev:format`, etc.)
- **DO NOT modify files in `src/primitives/`** - these are protected UI primitives
- **Component Placement**: Page-specific components go in page/components/, shared in src/components/

## Prerequisites Check (from Phase 1)
- [ ] Admin infrastructure fully functional
- [ ] User roles and permissions system working
- [ ] Admin can assign roles to users
- [ ] Protected admin routes accessible only to admins
- [ ] Database migration system working

## Current State Analysis
- Basic `tools` table with fixed categories (strings)
- No dynamic properties or attributes
- Limited categorization system
- Need to integrate comprehensive product taxonomy (5000+ categories)
- Need to transform into professional item data collection system

## Phase 2 Components

### 1. Database Schema (`database-schema.md`)
- External Product Taxonomy import table with ID and hierarchical paths
- Categories table synchronized with external taxonomy
- Attribute Definitions table for dynamic properties
- Enhanced Items table with JSONB dynamic data and external category IDs
- Category-Attribute associations with validation rules

### 2. Category Operations (`category-operations.md`) 
- External taxonomy import and synchronization logic
- Category lookup by external ID and path
- Hierarchy navigation using structured taxonomy
- Taxonomy update and version management

### 3. Attribute Operations (`attribute-operations.md`)
- Dynamic attribute definition management
- Validation rule processing
- Type-safe attribute handling

### 4. Item Enhancement (`item-enhancement.md`)
- Enhanced item management with dynamic properties
- JSONB data operations
- Category-specific validation

### 5. Data Migration (`data-migration.md`)
- Migration from existing tools to new items system
- Data transformation scripts
- Backward compatibility handling

## Success Criteria
- External Product Taxonomy successfully imported (5000+ categories)
- Categories table synchronized with external taxonomy
- External category IDs and hierarchical paths properly stored
- Attribute Definitions table with validation rules working
- Enhanced Items table with JSONB dynamic properties functional
- Data migration from existing tools completed successfully
- Admin can browse and assign external categories to items
- All new code follows repository naming conventions
- Database performance remains optimal with large taxonomy
- All files under 150 lines with proper imports

## Next Phase Dependencies
- Dynamic categories and attributes system operational
- Items can have category-specific properties
- Foundation ready for admin interface development
- Data model supports external taxonomy integration

## File Structure Created
```
docs/implementation/phase-2/
├── overview.md (this file)
├── database-schema.md
├── category-operations.md  
├── attribute-operations.md
├── item-enhancement.md
├── data-migration.md
``` 