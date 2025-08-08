import { createClient } from "@/common/supabase/server";

export async function getAddToolData() {
  const supabase = await createClient();

  // Fetch categories for the form
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select(
      `
      id,
      name,
      slug,
      parent_id,
      sort_order
    `,
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (categoriesError) throw categoriesError;

  // Build category tree structure
  const categoryTree = buildCategoryTree(categories || []);

  return {
    categories: categoryTree,
    categoryOptions: flattenCategoryTree(categoryTree),
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  children?: Category[];
}

function buildCategoryTree(categories: Category[]): Category[] {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  // Create a map of all categories
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Build the tree structure
  categories.forEach((category) => {
    const categoryWithChildren = categoryMap.get(category.id)!;

    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children!.push(categoryWithChildren);
      }
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });

  return rootCategories;
}

function flattenCategoryTree(
  categories: Category[],
  level = 0,
): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];

  categories.forEach((category) => {
    const indent = "  ".repeat(level);
    options.push({
      value: category.id,
      label: `${indent}${category.name}`,
    });

    if (category.children && category.children.length > 0) {
      options.push(...flattenCategoryTree(category.children, level + 1));
    }
  });

  return options;
}
