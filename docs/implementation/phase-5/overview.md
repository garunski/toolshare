# Phase 5: External Taxonomy Integration Overview

## Purpose
Implement comprehensive external taxonomy integration with intelligent categorization, automated attribute population, and data quality management. This phase enables the system to leverage professional product taxonomy to ensure accurate categorization and user-friendly item data collection.

## Critical Repository Rules
- **File Size Limit**: All files MUST be under 150 lines
- **Naming**: Use anti-generic naming conventions (specific, descriptive names)
- **Imports**: No deep relative imports (../../../) - use absolute paths via @/ alias
- **Commands**: Use `task` commands for all operations (`task dev:lint`, `task dev:format`, etc.)
- **DO NOT modify files in `src/primitives/`** - these are protected UI primitives
- **Component Placement**: Page-specific components go in page/components/, shared in src/components/

## Prerequisites Check (from Phase 4)
- [ ] Dynamic form system operational
- [ ] Item creation/editing uses category-specific forms
- [ ] Form validation system working correctly
- [ ] Admin can manage categories and attributes
- [ ] System ready for external taxonomy integration

## Current State Analysis
- Dynamic forms and validation working
- Internal category/attribute system operational
- Need comprehensive external taxonomy integration
- Need mapping between external taxonomy and internal categories
- Need data quality validation for consistent categorization

## Phase 5 Components

### 1. External Taxonomy Import (`external-taxonomy-integration.md`)
- Automated import from external taxonomy source
- TSV parsing of 5000+ categories with IDs and hierarchical paths
- Database storage of complete taxonomy structure
- Periodic updates and version management

### 2. Category Import Engine (`category-import-engine.md`) 
- External taxonomy validation and processing
- Category-specific field enforcement
- Core vs optional attribute management
- Data quality requirement handling

### 3. Intelligent Categorization (`intelligent-categorization.md`)
- AI-assisted product categorization using external taxonomy
- Smart categorization with hierarchical path suggestions
- Category suggestion based on product attributes
- Categorization confidence scoring

### 4. Attribute Mapping System (`attribute-mapping-system.md`)
- External attribute to internal field mapping
- Core attribute standardization (ID, title, description, etc.)
- Category-specific attribute requirements
- Validation rule synchronization

### 5. Auto-Population Engine (`auto-population-engine.md`)
- Category-compliant field suggestions
- Smart defaults based on taxonomy requirements
- Enhanced product information recommendation system
- Category-driven field population

## Success Criteria
- Complete External Product Taxonomy imported (5000+ categories from TSV file)
- All category IDs and hierarchical paths stored and searchable
- Automatic categorization suggests appropriate category from comprehensive taxonomy
- Data quality validation ensures consistent categorization
- Core attributes (ID, title, description, location, images, availability, condition) properly validated
- Category-specific attributes automatically enforced (tools, equipment, electronics, etc.)
- Enhanced product information strongly recommended for optimal experience
- Periodic taxonomy updates from external source
- All files under 150 lines with proper imports

## Next Phase Dependencies
- External taxonomy integration operational
- Compliance validation preventing disapprovals
- Auto-categorization working reliably
- Foundation ready for advanced optimization features

## File Structure Created
```
docs/implementation/phase-5/
├── overview.md (this file)
├── external-taxonomy-integration.md
├── category-import-engine.md  
├── intelligent-categorization.md
├── attribute-mapping-system.md
└── auto-population-engine.md
``` 