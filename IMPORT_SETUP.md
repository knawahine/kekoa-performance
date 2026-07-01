# PDF Program Import — Setup

The "Import Program" feature (Today → Program Settings → 📄 Import Program from PDF)
needs three one-time setup steps. The Anthropic API key lives **only** as a
Supabase Edge Function secret — it is never bundled into the frontend.

## Prerequisites

- Supabase CLI installed and logged in: `supabase login`
- Project linked: `supabase link --project-ref awqjcbbltfokplkmddnc`
- An Anthropic API key (starts with `sk-ant-...`) from https://console.anthropic.com

## 1. Create the `user_foods` table

In the Supabase dashboard → SQL Editor, paste and run the contents of:

```
supabase-program-import.sql
```

This creates the `user_foods` table (with RLS) that stores per-100g macros for
foods imported from PDFs that aren't in the built-in food database.

## 2. Deploy the Edge Function

From the project root (`~/Desktop/kekoa-performance`):

```bash
supabase functions deploy parse-program
```

## 3. Set the Anthropic API key secret

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here
```

The function reads this via `Deno.env.get("ANTHROPIC_API_KEY")`. It uses the
`claude-sonnet-4-6` model and sends the PDF as a base64 `document` block.

> ⚠️ Never put the Anthropic key in `.env.local`, `VITE_*` vars, or any frontend
> file. Anything prefixed `VITE_` is shipped to the browser. The key belongs
> only in Supabase secrets.

## Verify

1. `npm run dev`, sign in.
2. Today tab → ⚙️ Program Settings → 📄 Import Program from PDF.
3. Pick a training-program PDF. A spinner ("Parsing your program…") appears
   while Claude reads it, then a review screen shows the extracted split, meals,
   macros, and supplements as expandable cards.
4. Any food not already in your database appears under "NEW FOODS" with
   Claude-estimated per-100g macros flagged "ESTIMATED — VERIFY". Edit as needed.
5. "Confirm & Activate Program" saves to `custom_splits`, `custom_meals`,
   `user_foods`, and `programs`, then the Today/Training/Meals tabs switch to the
   imported program.

## Troubleshooting

- **"Server is missing ANTHROPIC_API_KEY"** → run step 3, then redeploy isn't
  needed (secrets apply immediately).
- **"Model did not return valid JSON"** → the PDF may be image-only/low quality.
  Try a clearer text-based PDF.
- **Table errors on confirm** → make sure step 1 ran and the existing
  `supabase-phase3.sql` (custom_splits / custom_meals) was applied previously.
