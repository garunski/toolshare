import type { Category, CategoryTreeNode } from "@/types/categories";

export class CategoryFormatter {
  // Get category display name with hierarchy
  static getDisplayName(category: CategoryTreeNode, showPath = false): string {
    if (showPath && category.level > 0) {
      return category.path;
    }
    return category.name;
  }

  // Get category icon with fallback
  static getIcon(category: Category): string {
    return category.icon || "folder";
  }

  // Get category color with fallback
  static getColor(category: Category): string {
    return category.color || "#6b7280";
  }

  /**
   * Format category for breadcrumb display
   */
  static formatBreadcrumb(path: string): Array<{ name: string }> {
    return path.split(" > ").map((name) => ({ name: name.trim() }));
  }

  /**
   * Get category depth indicator
   */
  static getDepthIndicator(level: number): string {
    return "  ".repeat(level) + (level > 0 ? "└ " : "");
  }

  /**
   * Generate category badge classes
   */
  static getBadgeClasses(category: Category): string {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    if (category.color) {
      // Use category-specific color
      return `${baseClasses} text-white`;
    }

    // Default styling
    return `${baseClasses} bg-gray-100 text-gray-800`;
  }

  /**
   * Format category stats
   */
  static formatStats(itemCount: number): string {
    if (itemCount === 0) return "No items";
    if (itemCount === 1) return "1 item";
    return `${itemCount.toLocaleString()} items`;
  }

  /**
   * Sort categories by name
   */
  static sortByName(categories: Category[]): Category[] {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Sort categories by sort order, then name
   */
  static sortBySortOrder(categories: Category[]): Category[] {
    return [...categories].sort((a, b) => {
      const aOrder = a.sort_order ?? 0;
      const bOrder = b.sort_order ?? 0;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Filter active categories
   */
  static filterActive(categories: Category[]): Category[] {
    return categories.filter((cat) => cat.is_active);
  }

  /**
   * Find category by slug
   */
  static findBySlug(
    categories: Category[],
    slug: string,
  ): Category | undefined {
    return categories.find((cat) => cat.slug === slug);
  }

  /**
   * Get all descendant category IDs
   */
  static getDescendantIds(categories: Category[], parentId: string): string[] {
    const descendants: string[] = [];
    const children = categories.filter((cat) => cat.parent_id === parentId);

    for (const child of children) {
      descendants.push(child.id);
      descendants.push(...this.getDescendantIds(categories, child.id));
    }

    return descendants;
  }
}
