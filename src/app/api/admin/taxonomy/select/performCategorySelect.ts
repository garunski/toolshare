import { createClient } from "@/common/supabase/server";

export class PerformCategorySelect {
  /**
   * Get categories for dropdown/select options
   */
  static async selectCategories(): Promise<
    Array<{ id: string; name: string; path: string }>
  > {
    const supabase = await createClient();

    // Get all categories
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error("Failed to fetch categories");
    }

    // Build tree structure
    const tree = this.buildCategoryTree(categories || []);

    // Flatten for select options
    return this.flattenTreeForSelect(tree);
  }

  private static buildCategoryTree(categories: any[]): any[] {
    const categoryMap = new Map();
    const roots: any[] = [];

    // Create map of all categories
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build tree structure
    categories.forEach((category) => {
      const node = categoryMap.get(category.id);
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        const parent = categoryMap.get(category.parent_id);
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  private static flattenTreeForSelect(
    tree: any[],
    path: string = "",
  ): Array<{ id: string; name: string; path: string }> {
    const result: Array<{ id: string; name: string; path: string }> = [];

    tree.forEach((node) => {
      const currentPath = path ? `${path} > ${node.name}` : node.name;
      result.push({
        id: node.id,
        name: node.name,
        path: currentPath,
      });

      if (node.children && node.children.length > 0) {
        result.push(...this.flattenTreeForSelect(node.children, currentPath));
      }
    });

    return result;
  }
}
