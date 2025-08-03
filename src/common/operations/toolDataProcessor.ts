import {
  ToolCreationData,
  ToolSearchData,
  ToolUpdateData,
} from "@/common/validators/toolCreationValidator";
import type { Database } from "@/types/supabase";

import { ToolCRUD, type ToolOperationResult } from "./toolCRUD";
import { ToolQueries } from "./toolQueries";

type Tool = Database["public"]["Tables"]["tools"]["Row"];

export { type ToolOperationResult } from "./toolCRUD";

export class ToolDataProcessor {
  static async createTool(
    toolData: ToolCreationData,
    ownerId: string,
  ): Promise<ToolOperationResult<Tool>> {
    return ToolCRUD.createTool(toolData, ownerId);
  }

  static async updateTool(
    toolId: string,
    updateData: ToolUpdateData,
  ): Promise<ToolOperationResult<Tool>> {
    return ToolCRUD.updateTool(toolId, updateData);
  }

  static async deleteTool(toolId: string): Promise<ToolOperationResult> {
    return ToolCRUD.deleteTool(toolId);
  }

  static async getToolById(toolId: string): Promise<ToolOperationResult<Tool>> {
    return ToolCRUD.getToolById(toolId);
  }

  static async getUserTools(
    userId: string,
  ): Promise<ToolOperationResult<Tool[]>> {
    return ToolQueries.getUserTools(userId);
  }

  static async searchTools(
    searchData: ToolSearchData,
  ): Promise<ToolOperationResult<Tool[]>> {
    return ToolQueries.searchTools(searchData);
  }

  static async getAvailableTools(): Promise<ToolOperationResult<Tool[]>> {
    return ToolQueries.getAvailableTools();
  }
}
