import { createClient } from "@/common/supabase/server";

import { processCategoryAttributes } from "./processCategoryAttributes";
import type { CategoryRequirements } from "./types";

export async function getCategoryRequirements(
  categoryId: number,
): Promise<CategoryRequirements> {
  try {
    const supabase = await createClient();
    const { data: categoryAttrs } = await supabase
      .from("category_attributes")
      .select(
        `
        attribute_definitions (
          name,
          display_label,
          data_type,
          validation_rules,
          default_value
        ),
        is_required,
        display_order
      `,
      )
      .eq("category_id", categoryId);

    return processCategoryAttributes(categoryAttrs || []);
  } catch (error) {
    console.error("Get category requirements error:", error);
    return {
      requiredFields: [],
      optionalFields: [],
      fieldTypes: {},
      validationRules: {},
    };
  }
}
