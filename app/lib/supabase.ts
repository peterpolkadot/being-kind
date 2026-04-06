import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getRun() {
  const db = getSupabase();
  const runId = process.env.SITE_RUN_ID!;
  const { data } = await db
    .from("tm_runs")
    .select("id, topic, category")
    .eq("id", runId)
    .single();
  return data;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function deslugify(slug: string) {
  return slug.replace(/-/g, " ");
}
