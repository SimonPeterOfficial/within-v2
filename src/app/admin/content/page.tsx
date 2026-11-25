import ContentTable from "@/components/admin/ContentTable";
import { getRealContent } from "@/lib/admin/real-data";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  let items: Awaited<ReturnType<typeof getRealContent>> = [];
  let error: string | null = null;

  try {
    items = await getRealContent(100);
  } catch {
    error = "Unable to load content right now.";
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">
        Content
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white mb-6">
        Content Management
      </h2>
      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-6 text-sm text-rose-300">
          {error}
        </div>
      ) : (
        <ContentTable
          items={items.map((item) => ({ ...item, viewCount: Number(item.viewCount) }))}
        />
      )}
    </div>
  );
}
