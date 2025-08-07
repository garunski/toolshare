import { NextRequest, NextResponse } from "next/server";

import { CORE_MAPPINGS, MappingHelpers } from "./mappingHelpers";

export async function POST(request: NextRequest) {
  try {
    const { action, data, mappings } = await request.json();

    switch (action) {
      case "processCategoryAttributes":
        if (!data) {
          return NextResponse.json(
            { error: "Missing required field: data" },
            { status: 400 },
          );
        }
        const processedMappings =
          MappingHelpers.processCategoryAttributes(data);
        return NextResponse.json({
          success: true,
          mappings: processedMappings,
        });

      case "processCategoryAttributesForValidation":
        if (!data) {
          return NextResponse.json(
            { error: "Missing required field: data" },
            { status: 400 },
          );
        }
        const validationData =
          MappingHelpers.processCategoryAttributesForValidation(data);
        return NextResponse.json({ success: true, validationData });

      case "mapAttributes":
        if (!data || !mappings) {
          return NextResponse.json(
            { error: "Missing required fields: data and mappings" },
            { status: 400 },
          );
        }
        const mappedData = MappingHelpers.mapAttributes(data, mappings);
        return NextResponse.json({ success: true, mappedData });

      case "validateAttributeMapping":
        if (!mappings) {
          return NextResponse.json(
            { error: "Missing required field: mappings" },
            { status: 400 },
          );
        }
        const isValid = MappingHelpers.validateAttributeMapping(mappings);
        return NextResponse.json({ success: true, isValid });

      case "resolveAttributeMappingConflicts":
        if (!data?.mappings1 || !data?.mappings2) {
          return NextResponse.json(
            { error: "Missing required fields: mappings1 and mappings2" },
            { status: 400 },
          );
        }
        const resolvedMappings =
          MappingHelpers.resolveAttributeMappingConflicts(
            data.mappings1,
            data.mappings2,
          );
        return NextResponse.json({ success: true, resolvedMappings });

      case "getCoreMappings":
        return NextResponse.json({
          success: true,
          coreMappings: CORE_MAPPINGS,
        });

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Use 'processCategoryAttributes', 'mapAttributes', 'validateAttributeMapping', 'resolveAttributeMappingConflicts', or 'getCoreMappings'",
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error managing attribute mappings:", error);
    return NextResponse.json(
      { error: "Failed to manage attribute mappings" },
      { status: 500 },
    );
  }
}
