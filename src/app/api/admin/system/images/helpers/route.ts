import { NextRequest, NextResponse } from "next/server";

import { ImageHelpers } from "./imageHelpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const bucket = searchParams.get("bucket");
    const path = searchParams.get("path");

    if (action === "public-url" && bucket && path) {
      const publicUrl = ImageHelpers.getPublicUrl(bucket, path);
      return NextResponse.json({ publicUrl });
    }

    return NextResponse.json(
      { error: "Invalid action or missing parameters" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to handle image request" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();

    if (action === "calculate-dimensions") {
      const { originalWidth, originalHeight, maxWidth, maxHeight } = body;
      const dimensions = ImageHelpers.calculateDimensions(
        originalWidth,
        originalHeight,
        maxWidth,
        maxHeight,
      );
      return NextResponse.json(dimensions);
    }

    if (action === "check-file") {
      const { file } = body;
      const isImage = ImageHelpers.isImageFile(file);
      return NextResponse.json({ isImage });
    }

    if (action === "get-extension") {
      const { filename } = body;
      const extension = ImageHelpers.getFileExtension(filename);
      return NextResponse.json({ extension });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process image request" },
      { status: 500 },
    );
  }
}
