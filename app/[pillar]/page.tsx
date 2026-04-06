import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase, getRun, slugify } from "../lib/supabase";

export const revalidate = 3600;

export default async function PillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar: pillarSlug } = await params;
  const run = await getRun();
  const db = getSupabase();

  if (!run) notFound();

  // Find real pillar name from slug
  const { data: allTopics } = await db
    .from("tm_topics")
    .select("angle, topic, context, created_at")
    .eq("run_id", run.id);

  const angles = [...new Set((allTopics ?? []).map((t: any) => t.angle as string))];
  const pillarName = angles.find((a) => slugify(a) === pillarSlug);

  if (!pillarName) notFound();

  // Items in this pillar
  const items = (allTopics ?? [])
    .filter((t: any) => t.angle === pillarName)
    .sort((a: any, b: any) => a.created_at.localeCompare(b.created_at));

  // Which items have content
  const itemNames = items.map((i: any) => i.topic);
  const { data: contentRows } = await db
    .from("tm_content")
    .select("item")
    .eq("topic_id", run.id)
    .in("item", itemNames);

  const hasContent = new Set((contentRows ?? []).map((c: any) => c.item));

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 flex items-center gap-2">
        <Link href="/" className="hover:text-amber-600 transition-colors capitalize">
          {run.topic}
        </Link>
        <span>›</span>
        <span className="text-gray-600">{pillarName}</span>
      </nav>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{pillarName}</h1>
        <p className="text-gray-500">{items.length} articles</p>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item: any) => {
          const ready = hasContent.has(item.topic);
          return (
            <Link
              key={item.topic}
              href={`/${pillarSlug}/${slugify(item.topic)}`}
              className={`group border rounded-xl p-4 transition-all space-y-1
                ${ready
                  ? "border-gray-200 hover:border-amber-400 hover:shadow-sm"
                  : "border-dashed border-gray-200 opacity-50 pointer-events-none"
                }`}
            >
              <h2 className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors text-sm">
                {item.topic}
              </h2>
              {!ready && <p className="text-[10px] text-gray-400">Coming soon</p>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
