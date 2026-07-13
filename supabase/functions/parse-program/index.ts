// Supabase Edge Function: parse-program
// Receives a base64 PDF, sends it to the Anthropic API (claude-sonnet-4-6),
// and returns structured JSON describing the training program.
//
// The Anthropic API key is read from the ANTHROPIC_API_KEY secret and is
// NEVER exposed to the frontend.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BASE_SYSTEM_PROMPT =
  "You are a fitness program parser. Extract the following from this training program PDF and return ONLY valid JSON with no other text: training_split as an array of 7 objects Mon-Sun each with day, session_name, subtitle, type (training or off), exercises (array of {name, sets, reps, rest, notes, progression}). meals as an object with training_day and off_day keys, each containing an array of meals with name, time, foods (array of {name, grams}). macro_targets as an object with training {cal, p, c, f} and off {cal, p, c, f}. supplements as an array of {name, timing, dose}. If any section is not found in the PDF, return null for that key.";

function buildSystemPrompt(knownFoods: string[]): string {
  const known = (knownFoods || []).join(", ");
  return (
    BASE_SYSTEM_PROMPT +
    " Additionally, include a key unknown_foods: an array of objects for every food that appears in meals but is NOT already in this known-foods list: [" +
    known +
    "]. Each unknown_foods object must have {name, protein_per_100g, carbs_per_100g, fat_per_100g, cal_per_100g, estimated} where estimated is always true and the per-100g macro values are your best nutritional estimate for that food. If there are no unknown foods, return an empty array for unknown_foods."
  );
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Extract the text content from the Anthropic response, strip any markdown
// code fences / surrounding prose, and return the inner JSON string.
function extractJsonText(data: any): string {
  const block = (data?.content || []).find((b: any) => b.type === "text");
  let text: string = block?.text ?? "";
  text = text.trim();
  // Strip ```json ... ``` or ``` ... ``` fences if present.
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }
  // If the model wrapped the JSON in prose, slice from the first { to the
  // last } so JSON.parse gets a clean object.
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first > 0 && last > first) {
    text = text.slice(first, last + 1);
  }
  return text;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return jsonResponse(
      { error: "Server is missing ANTHROPIC_API_KEY. Set it with: supabase secrets set ANTHROPIC_API_KEY=..." },
      500,
    );
  }

  let pdfBase64: string;
  let knownFoods: string[];
  try {
    const body = await req.json();
    pdfBase64 = body.pdfBase64;
    knownFoods = Array.isArray(body.knownFoods) ? body.knownFoods : [];
    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      return jsonResponse({ error: "Missing pdfBase64 in request body." }, 400);
    }
  } catch {
    return jsonResponse({ error: "Invalid JSON request body." }, 400);
  }

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 24000,
        system: buildSystemPrompt(knownFoods),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              { type: "text", text: "Parse this program." },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    return jsonResponse(
      { error: "Failed to reach Anthropic API: " + (err as Error).message },
      502,
    );
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    // Pull a human-readable reason out of the Anthropic error envelope.
    let reason = errText;
    try {
      const j = JSON.parse(errText);
      reason = j?.error?.message || errText;
    } catch { /* keep raw text */ }
    return jsonResponse(
      {
        error: "Anthropic API error (" + anthropicRes.status + "): " + String(reason).slice(0, 300),
        detail: errText,
      },
      502,
    );
  }

  const data = await anthropicRes.json();
  const jsonText = extractJsonText(data);
  const stopReason = data?.stop_reason;

  try {
    const parsed = JSON.parse(jsonText);
    return jsonResponse(parsed, 200);
  } catch {
    const truncated = stopReason === "max_tokens";
    const msg = truncated
      ? "The program was too long to parse in one pass (response was truncated). Try a shorter PDF or split it."
      : "Model did not return valid JSON.";
    return jsonResponse(
      { error: msg, stop_reason: stopReason, raw: jsonText?.slice(0, 4000) },
      502,
    );
  }
});
