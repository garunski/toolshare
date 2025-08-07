import { NextRequest, NextResponse } from "next/server";

import { getOptimizedImageUrl, optimizeImage } from "./optimizeImage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const path = formData.get("path") as string;
    const generateVariants = formData.get("generateVariants") === "true";

    if (!file || !bucket || !path) {
      return NextResponse.json(
        { error: "file, bucket, and path are required" },
        { status: 400 },
      );
    }

    const result = await optimizeImage(file, bucket, path, generateVariants);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Image optimization route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const originalUrl = searchParams.get("url");
    const size =
      (searchParams.get("size") as
        | "thumbnail"
        | "small"
        | "medium"
        | "large") || "medium";

    if (!originalUrl) {
      return NextResponse.json(
        { error: "url parameter is required" },
        { status: 400 },
      );
    }

    const optimizedUrl = getOptimizedImageUrl(originalUrl, size);

    return NextResponse.json({ url: optimizedUrl });
  } catch (error) {
    console.error("Get optimized image URL route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
