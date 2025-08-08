import { NextRequest } from "next/server";

export function logRequest(request: NextRequest, response: Response) {
  const { method, url } = request;
  const { status } = response;
  const userAgent = request.headers.get("user-agent") || "unknown";
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  console.log(
    `[${new Date().toISOString()}] ${method} ${url} ${status} - ${ip} - ${userAgent}`,
  );
}
