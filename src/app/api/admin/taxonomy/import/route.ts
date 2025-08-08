import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/common/supabase/server";

import { PerformTaxonomyImport } from "./performTaxonomyImport";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 },
      );
    }

    // Check admin permissions
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role:roles(name)")
      .eq("user_id", user.id);

    const isAdmin = userRoles?.some(
      (ur: any) => (ur.role as any)?.name === "admin",
    );
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { sourceUrl } = await request.json();

    if (!sourceUrl) {
      return NextResponse.json(
        { error: "Source URL required" },
        { status: 400 },
      );
    }

    // Start import process
    const result = await PerformTaxonomyImport.importFromTSV(sourceUrl);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${result.imported} categories`,
        stats: {
          imported: result.imported,
          errors: result.errors,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Import completed with errors",
          stats: {
            imported: result.imported,
            errors: result.errors,
          },
        },
        { status: 207 },
      ); // Multi-status
    }
  } catch (error) {
    console.error("Taxonomy import error:", error);
    return NextResponse.json(
      { error: "Internal server error during import" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 },
      );
    }

    // Check admin permissions
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role:roles(name)")
      .eq("user_id", user.id);

    const isAdmin = userRoles?.some(
      (ur: any) => (ur.role as any)?.name === "admin",
    );
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Get import statistics
    const stats = await PerformTaxonomyImport.getImportStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Taxonomy stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
