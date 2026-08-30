import { getTrendingResponse } from "@/lib/trending";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const response = await getTrendingResponse({
    period: searchParams.get("period"),
    category: searchParams.get("category"),
    limit: searchParams.get("limit"),
    cursor: searchParams.get("cursor")
  });

  return Response.json(response, {
    headers: {
      "cache-control": "public, s-maxage=300, stale-while-revalidate=1800"
    }
  });
}