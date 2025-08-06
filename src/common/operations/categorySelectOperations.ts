import { CategoryOperations } from "@/common/operations/categoryOperations";
import { CategoryTreeBuilder } from "@/common/operations/categoryTreeBuilder";

export class CategorySelectOperations {
  /**
   * Get categories for dropdown/select options
   */
  static async getCategoriesForSelect(): Promise<
    Array<{ id: string; name: string; path: string }>
  > {
    const tree = await CategoryOperations.getAllCategoriesTree();
    return CategoryTreeBuilder.flattenTreeForSelect(tree);
  }
}
