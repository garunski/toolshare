import type { Category, CategoryTreeNode } from "@/types/categories";

export class BuildCategoryTree {
  /**
   * Build hierarchical tree structure from flat category list
   */
  static getCategoryHierarchy(categories: Category[]): CategoryTreeNode[] {
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // Create category nodes
    categories.forEach((category) => {
      const node: CategoryTreeNode = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon ?? undefined,
        color: category.color ?? undefined,
        level: 0,
        path: category.name,
        hasChildren: false,
        children: [],
      };
      categoryMap.set(category.id, node);
    });

    // Build hierarchy
    categories.forEach((category) => {
      const node = categoryMap.get(category.id)!;

      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children!.push(node);
          parent.hasChildren = true;
          node.level = parent.level + 1;
          node.path = `${parent.path} > ${node.name}`;
        }
      } else {
        rootCategories.push(node);
      }
    });

    // Sort children by sort_order and name
    this.sortCategoryTree(rootCategories);
    return rootCategories;
  }

  /**
   * Sort categories recursively by name
   */
  private static sortCategoryTree(cats: CategoryTreeNode[]): void {
    cats.sort((a, b) => a.name.localeCompare(b.name));
    cats.forEach((cat) => {
      if (cat.children && cat.children.length > 0) {
        this.sortCategoryTree(cat.children);
      }
    });
  }

  /**
   * Flatten tree structure for select options
   */
  static flattenTreeForSelect(
    tree: CategoryTreeNode[],
  ): Array<{ id: string; name: string; path: string }> {
    const options: Array<{ id: string; name: string; path: string }> = [];

    const flatten = (nodes: CategoryTreeNode[]) => {
      nodes.forEach((node) => {
        options.push({
          id: node.id,
          name: node.name,
          path: node.path,
        });
        if (node.children && node.children.length > 0) {
          flatten(node.children);
        }
      });
    };

    flatten(tree);
    return options;
  }
}
