import { NextRequest, NextResponse } from "next/server";

import { deleteToolImage, uploadToolImage } from "./uploadToolImage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const toolId = formData.get("toolId") as string;
    const userId = formData.get("userId") as string;

    if (!file || !toolId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: file, toolId, userId" },
        { status: 400 },
      );
    }

    const result = await uploadToolImage({ file, toolId, userId });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tool image upload route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("imageUrl");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing imageUrl parameter" },
        { status: 400 },
      );
    }

    const result = await deleteToolImage(imageUrl);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tool image deletion route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
