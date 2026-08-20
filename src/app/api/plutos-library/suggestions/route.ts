import { getLibrarySuggestions } from "@/lib/plutos-library";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  return Response.json({
    suggestions: getLibrarySuggestions(query, 8)
  });
}
