import { getLibraryTool } from "@/lib/plutos-library";

const allowedEvents = new Set([
  "tool_view",
  "website_click",
  "bookmark",
  "compare",
  "share",
  "search_click"
]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      eventType?: string;
      toolSlug?: string;
      anonymousSessionId?: string;
    };
    const eventType = body.eventType ?? "";
    const toolSlug = body.toolSlug ?? "";

    if (!allowedEvents.has(eventType) || !getLibraryTool(toolSlug)) {
      return Response.json({ ok: false }, { status: 400 });
    }

    return Response.json({
      ok: true,
      stored: false,
      reason: "Supabase analytics is ready in the migration; local fallback accepts the event without persistence."
    });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
