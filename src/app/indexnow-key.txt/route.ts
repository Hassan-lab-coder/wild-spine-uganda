import { NextResponse } from "next/server";
import { indexNowKey } from "@/lib/indexnow";

export function GET() {
  const key = indexNowKey();

  return new NextResponse(key, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
