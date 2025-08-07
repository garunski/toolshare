import { CategoryOperations } from "@/common/operations/categoryOperations";
import { CategoryTreeBuilder } from "@/common/operations/categoryTreeBuilder";

export class PerformCategorySelect {
  /**
   * Get categories for dropdown/select options
   */
  static async selectCategories(): Promise<
    Array<{ id: string; name: string; path: string }>
  > {
    const tree = await CategoryOperations.getAllCategoriesTree();
    return CategoryTreeBuilder.flattenTreeForSelect(tree);
  }
}
