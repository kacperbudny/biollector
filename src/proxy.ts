import { type NextRequest, NextResponse } from "next/server";
import { withRequestId } from "@/lib/logger";

export function proxy(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const log = withRequestId(requestId);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  log.info("HTTP request", {
    method: request.method,
    path: request.nextUrl.pathname,
  });

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - Public image assets under /sets/
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|sets/|favicon.ico).*)",
  ],
};
