import { createClient } from "@supabase/supabase-js";
import { getLibraryTool } from "@/lib/plutos-library";
import type { TrendEventType } from "@/lib/trending";

const allowedEvents = new Set<TrendEventType>([
  "search_impression",
  "search_click",
  "tool_detail_view",
  "compare_add",
  "outbound_click",
  "share"
]);

const legacyEventMap: Record<string, TrendEventType> = {
  bookmark: "share",
  compare: "compare_add",
  tool_view: "tool_detail_view",
  website_click: "outbound_click"
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      eventType?: string;
      toolSlug?: string;
      anonymousSessionId?: string;
    };
    const eventType = normalizeEventType(body.eventType ?? "");
    const toolSlug = body.toolSlug ?? "";
    const tool = getLibraryTool(toolSlug);

    if (!eventType || !tool) {
      return Response.json({ ok: false }, { status: 400 });
    }

    const stored = await storeTrendEvent({
      anonymousSessionId: body.anonymousSessionId,
      eventType,
      toolSlug: tool.slug
    });

    return Response.json({
      ok: true,
      stored,
      reason: stored ? "Stored anonymized trend event." : "Accepted without persistence because Supabase analytics is not configured."
    });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}

async function storeTrendEvent({
  anonymousSessionId,
  eventType,
  toolSlug
}: {
  anonymousSessionId?: string;
  eventType: TrendEventType;
  toolSlug: string;
}) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const sessionHash = sanitizeSessionHash(anonymousSessionId);

  if (!supabaseUrl || !supabaseAnonKey || !sessionHash) return false;

  const occurredAt = new Date();
  const dedupeWindow = occurredAt.toISOString().slice(0, 13);
  const dedupeKey = `${sessionHash}:${toolSlug}:${eventType}:${dedupeWindow}`;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const { data: toolRow } = await supabase.from("tools").select("id").eq("slug", toolSlug).maybeSingle();
  const toolId = isRecord(toolRow) && typeof toolRow.id === "string" ? toolRow.id : "";
  if (!toolId) return false;

  const { error } = await supabase.from("trend_events").insert({
    anonymous_session_hash: sessionHash,
    dedupe_key: dedupeKey,
    event_type: eventType,
    metadata: { source: "web" },
    occurred_at: occurredAt.toISOString(),
    tool_id: toolId
  });

  return !error;
}

function normalizeEventType(value: string): TrendEventType | null {
  const normalized = legacyEventMap[value] ?? value;
  return allowedEvents.has(normalized as TrendEventType) ? (normalized as TrendEventType) : null;
}

function sanitizeSessionHash(value: string | undefined) {
  return (value ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 96);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}