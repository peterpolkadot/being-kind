import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getSupabase, getRun, slugify } from "../../lib/supabase";
import type { Metadata } from "next";

export const revalidate = 3600;

async function getContent(runId: string, pillarSlug: string, itemSlug: string) {
  const db = getSupabase();

  const { data: allTopics } = await db
    .from("tm_topics")
    .select("angle, topic")
    .eq("run_id", runId);

  const angles = [...new Set((allTopics ?? []).map((t: any) => t.angle as string))];
  const pillarName = angles.find((a) => slugify(a) === pillarSlug);
  if (!pillarName) return null;

  const itemsInPillar = (allTopics ?? [])
    .filter((t: any) => t.angle === pillarName)
    .map((t: any) => t.topic as string);

  const itemName = itemsInPillar.find((i) => slugify(i) === itemSlug);
  if (!itemName) return null;

  const { data: contentRow } = await db
    .from("tm_content")
    .select("content, item, pillar")
    .eq("topic_id", runId)
    .eq("item", itemName)
    .single();

  return contentRow ? { ...contentRow, pillarName } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string; item: string }>;
}): Promise<Metadata> {
  const { pillar, item } = await params;
  const run = await getRun();
  if (!run) return {};
  const content = await getContent(run.id, pillar, item);
  if (!content) return {};
  return {
    title: content.item,
    description: content.content.replace(/[#*[\]]/g, "").slice(0, 155),
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ pillar: string; item: string }>;
}) {
  const { pillar: pillarSlug, item: itemSlug } = await params;
  const run = await getRun();

  if (!run) notFound();

  const content = await getContent(run.id, pillarSlug, itemSlug);
  if (!content) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-amber-600 transition-colors capitalize">
          {run.topic}
        </Link>
        <span>›</span>
        <Link href={`/${pillarSlug}`} className="hover:text-amber-600 transition-colors">
          {content.pillarName}
        </Link>
        <span>›</span>
        <span className="text-gray-600">{content.item}</span>
      </nav>

      {/* Article */}
      <article className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{content.item}</h1>
        <div className="prose prose-gray prose-headings:font-semibold prose-a:text-amber-600
          prose-strong:text-gray-900 max-w-none leading-relaxed">
          <ReactMarkdown>{content.content}</ReactMarkdown>
        </div>
      </article>

      {/* Back */}
      <div className="pt-6 border-t border-gray-100">
        <Link href={`/${pillarSlug}`} className="text-sm text-amber-600 hover:underline">
          ← Back to {content.pillarName}
        </Link>
      </div>
    </div>
  );
}
