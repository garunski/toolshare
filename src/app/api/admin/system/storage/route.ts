import { NextRequest, NextResponse } from "next/server";

import { OfflineStorageManager } from "./manageOfflineStorage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const type = searchParams.get("type");

    if (action === "get") {
      const result = await OfflineStorageManager.manageOfflineStorage(
        "get",
        undefined,
        type || undefined,
      );
      return NextResponse.json(result);
    }

    if (action === "stats") {
      const result = await OfflineStorageManager.manageOfflineStorage("stats");
      return NextResponse.json(result);
    }

    if (action === "sync") {
      const result = await OfflineStorageManager.syncOfflineData();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to handle offline storage request" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();

    if (action === "store") {
      const result = await OfflineStorageManager.manageOfflineStorage(
        "store",
        body,
      );
      return NextResponse.json(result);
    }

    if (action === "sync") {
      const result = await OfflineStorageManager.syncOfflineData();
      return NextResponse.json(result);
    }

    if (action === "clear") {
      const result = await OfflineStorageManager.manageOfflineStorage("clear");
      return NextResponse.json(result);
    }

    if (action === "handle") {
      const { handleAction, item } = body;
      const result = await OfflineStorageManager.handleOfflineData(
        handleAction,
        item,
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process offline storage request" },
      { status: 500 },
    );
  }
}
