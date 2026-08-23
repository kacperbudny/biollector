import { NextResponse } from "next/server";
import { z } from "zod";
import { setsService } from "@/dependency-injection";

const searchQuerySchema = z.object({
  q: z.string().max(200).default(""),
});

// TODO: a generic route handler if we have more of them
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid query" }, { status: 400 });
  }

  return NextResponse.json(setsService.searchSets(parsed.data.q));
}
