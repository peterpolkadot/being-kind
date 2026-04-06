import Link from "next/link";
import { getSupabase, getRun, slugify } from "./lib/supabase";

export const revalidate = 3600;

export default async function HomePage() {
  const run = await getRun();
  const db = getSupabase();

  if (!run) {
    return <p className="text-gray-400">Site not configured.</p>;
  }

  // Load index content for pillar list
  const { data: indexRow } = await db
    .from("tm_content")
    .select("content")
    .eq("topic_id", run.id)
    .eq("item", "_Index")
    .single();

  let pillars: string[] = [];
  if (indexRow?.content) {
    try {
      const parsed = JSON.parse(indexRow.content);
      pillars = parsed.pillars ?? [];
    } catch {}
  }

  // Fallback — pull distinct angles from tm_topics
  if (pillars.length === 0) {
    const { data: topics } = await db
      .from("tm_topics")
      .select("angle")
      .eq("run_id", run.id);
    if (topics) {
      pillars = [...new Set(topics.map((t: any) => t.angle as string))];
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-gray-900 capitalize">{run.topic}</h1>
        <p className="text-lg text-gray-500">
          Browse {pillars.length} categories covering everything about {run.topic}.
        </p>
      </div>

      {/* Pillar grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pillars.map((pillar) => (
          <Link
            key={pillar}
            href={`/${slugify(pillar)}`}
            className="group border border-gray-200 rounded-xl p-5 hover:border-amber-400
              hover:shadow-sm transition-all space-y-1"
          >
            <h2 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
              {pillar}
            </h2>
            <p className="text-xs text-gray-400">Browse articles →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
