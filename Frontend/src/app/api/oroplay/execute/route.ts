import { NextRequest, NextResponse } from "next/server";
import { callIntegrationApi, EndpointKey, INTEGRATION_ENDPOINTS } from "@/lib/oroplay";
import { rateLimit } from "@/lib/rate-limit";

const endpointPolicy: Partial<Record<EndpointKey, { limit: number; windowMs: number }>> = {
  bettingHistoryByDateV2: { limit: 1, windowMs: 1000 },
  batchUsersRtp: { limit: 1, windowMs: 3000 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const endpoint = body?.endpoint as EndpointKey;
    const payload = body?.payload;

    if (!endpoint || !(endpoint in INTEGRATION_ENDPOINTS)) {
      return NextResponse.json({ error: "Invalid endpoint key." }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const basePolicy = endpoint === "status" ? { limit: 20, windowMs: 1000 } : { limit: 10, windowMs: 1000 };
    const policy = endpointPolicy[endpoint] ?? basePolicy;
    const limiter = rateLimit(`oroplay:${ip}:${endpoint}`, policy.limit, policy.windowMs);

    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(policy.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.floor(limiter.resetAt / 1000)),
          },
        }
      );
    }

    const result = await callIntegrationApi(endpoint, payload);
    return NextResponse.json(result, {
      status: 200,
      headers: {
        "X-RateLimit-Limit": String(policy.limit),
        "X-RateLimit-Remaining": String(limiter.remaining),
        "X-RateLimit-Reset": String(Math.floor(limiter.resetAt / 1000)),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 }
    );
  }
}
