import { normalizeOfficialUrl } from "@/components/submissions/validation";
import { findSubmissionDuplicate } from "@/lib/tool-submission-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { toolName?: unknown; officialUrl?: unknown };
    const toolName = typeof body.toolName === "string" ? body.toolName.slice(0, 120) : "";
    const officialUrl = typeof body.officialUrl === "string" ? body.officialUrl.slice(0, 500) : "";
    if (!toolName.trim() || !normalizeOfficialUrl(officialUrl)) return Response.json({ error: "Invalid tool identity." }, { status: 400 });

    return Response.json({ duplicate: await findSubmissionDuplicate(toolName, officialUrl) });
  } catch {
    return Response.json({ error: "Duplicate check unavailable." }, { status: 400 });
  }
}
