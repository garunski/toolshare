import { Database } from "./supabase";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert =
  Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate =
  Database["public"]["Tables"]["categories"]["Update"];

export type AttributeDefinition =
  Database["public"]["Tables"]["attribute_definitions"]["Row"];
export type AttributeDefinitionInsert =
  Database["public"]["Tables"]["attribute_definitions"]["Insert"];
export type AttributeDefinitionUpdate =
  Database["public"]["Tables"]["attribute_definitions"]["Update"];

export type CategoryAttribute =
  Database["public"]["Tables"]["category_attributes"]["Row"];
export type CategoryAttributeInsert =
  Database["public"]["Tables"]["category_attributes"]["Insert"];
export type CategoryAttributeUpdate =
  Database["public"]["Tables"]["category_attributes"]["Update"];

export type Item = Database["public"]["Tables"]["items"]["Row"];
export type ItemInsert = Database["public"]["Tables"]["items"]["Insert"];
export type ItemUpdate = Database["public"]["Tables"]["items"]["Update"];

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  parent?: Category;
}

export interface CategoryWithAttributes extends Category {
  attributes: {
    id: string;
    name: string;
    display_label: string;
    data_type: string;
    is_required: boolean;
    display_order: number;
    validation_rules: any;
    options?: any;
  }[];
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  level: number;
  path: string;
  hasChildren: boolean;
  children?: CategoryTreeNode[];
}

export interface AttributeWithCategory extends AttributeDefinition {
  category_attributes: {
    is_required: boolean;
    display_order: number;
    category_specific_validation: any;
  }[];
}

export interface ItemWithCategory extends Item {
  category: Category;
  category_path?: string;
}

export type CategoryCreationRequest = {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  metadata?: Record<string, any>;
};

export type CategoryUpdateRequest = Partial<CategoryCreationRequest> & {
  id: string;
};

export type AttributeCreationRequest = {
  name: string;
  display_label: string;
  description?: string;
  data_type:
    | "text"
    | "number"
    | "boolean"
    | "date"
    | "select"
    | "multi_select"
    | "url"
    | "email";
  is_required?: boolean;
  validation_rules?: Record<string, any>;
  default_value?: string;
  options?: Record<string, any>;
  display_order?: number;
  is_searchable?: boolean;
  is_filterable?: boolean;
  help_text?: string;
};

export type AttributeUpdateRequest = Partial<AttributeCreationRequest> & {
  id: string;
};

export type ItemCreationRequest = {
  name: string;
  description?: string;
  category_id: string;
  condition: "excellent" | "good" | "fair" | "poor";
  attributes?: Record<string, any>;
  images?: string[];
  location?: string;
  is_available?: boolean;
  is_shareable?: boolean;
  is_public?: boolean;
  tags?: string[];
};

export type ItemUpdateRequest = Partial<ItemCreationRequest> & {
  id: string;
};
