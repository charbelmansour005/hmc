import type { Metadata } from "next";
import Link from "next/link";
import { Thumb } from "@/components/admin/Thumb";
import { buttonClass, EmptyState, PageHeader, UntranslatedNote } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { ACCENT_LABELS } from "@/lib/categories";
import { listDoctors } from "@/lib/doctors";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  await requireAdmin("/admin/team");
  const doctors = await listDoctors();

  return (
    <>
      <PageHeader
        title="Team"
        description="The “Meet the team” section. Members without a photo show a coloured placeholder."
        actions={
          <Link href="/admin/team/new" className={buttonClass.primary}>
            Add team member
          </Link>
        }
      />
      {doctors.length === 0 ? (
        <EmptyState>No team members yet, so the section is hidden on the website.</EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-white dark:border-white/10 bg-surface/90 shadow-md">
          {doctors.map((d) => (
            <li key={d.id}>
              <Link href={`/admin/team/${d.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-bg-soft">
                <Thumb image={d.photo} width={60} height={48} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">
                    {d.name}
                    <UntranslatedNote translations={d.translations} />
                  </p>
                  <p className="truncate text-xs text-muted">
                    {d.specialty} · {ACCENT_LABELS[d.accent]}
                  </p>
                </div>
                <span className="text-xs text-muted">#{d.sortOrder}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
