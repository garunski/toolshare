import { NextRequest, NextResponse } from "next/server";

import { PerformExternalTaxonomy } from "./performExternalTaxonomy";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const externalId = searchParams.get("externalId");
    const parentId = searchParams.get("parentId");
    const maxDepth = searchParams.get("maxDepth");
    const searchTerm = searchParams.get("search");
    const action = searchParams.get("action");

    if (action === "stats") {
      const stats = await PerformExternalTaxonomy.getCategoryStats();
      return NextResponse.json(stats);
    }

    if (externalId) {
      if (maxDepth) {
        const tree = await PerformExternalTaxonomy.getCategoryTree(
          parseInt(externalId),
          parseInt(maxDepth),
        );
        return NextResponse.json(tree);
      } else {
        const category = await PerformExternalTaxonomy.getCategoryById(
          parseInt(externalId),
        );
        return NextResponse.json(category);
      }
    }

    if (parentId) {
      const children = await PerformExternalTaxonomy.getCategoryChildren(
        parseInt(parentId),
      );
      return NextResponse.json(children);
    }

    if (searchTerm) {
      const limit = searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20;
      const categories = await PerformExternalTaxonomy.searchCategories(
        searchTerm,
        limit,
      );
      return NextResponse.json(categories);
    }

    // Default: get categories with pagination
    const options = {
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
      level: searchParams.get("level")
        ? parseInt(searchParams.get("level")!)
        : undefined,
      search: searchParams.get("search") || undefined,
      parentId: searchParams.get("parentId")
        ? parseInt(searchParams.get("parentId")!)
        : undefined,
    };

    const result =
      await PerformExternalTaxonomy.importExternalTaxonomy(options);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching external taxonomy:", error);
    return NextResponse.json(
      { error: "Failed to fetch external taxonomy" },
      { status: 500 },
    );
  }
}
