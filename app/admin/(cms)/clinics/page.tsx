import type { Metadata } from "next";
import Link from "next/link";
import { Thumb } from "@/components/admin/Thumb";
import { buttonClass, EmptyState, PageHeader, UntranslatedNote } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { listClinics } from "@/lib/clinics";
import { listServices } from "@/lib/services";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Clinics" };

export default async function ClinicsPage() {
  await requireAdmin("/admin/clinics");
  const [clinics, services, settings] = await Promise.all([listClinics(), listServices(), getSettings()]);
  const byId = new Map(services.map((s) => [s.id, s]));
  const label = (id: string) => byId.get(id)?.bookingLabel ?? byId.get(id)?.name ?? "—";
  // A clinic can point at a service whose section is hidden on the website (see Services).
  const inHiddenSection = (id: string) => {
    const service = byId.get(id);
    return service ? settings.hiddenSections.includes(service.category) : false;
  };

  return (
    <>
      <PageHeader
        title="Dedicated clinics"
        description="The “Dedicated clinics” section of the website."
        actions={
          <Link href="/admin/clinics/new" className={buttonClass.primary}>
            New clinic
          </Link>
        }
      />
      {clinics.length === 0 ? (
        <EmptyState>No clinics yet, so the section is hidden on the website.</EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-white dark:border-white/10 bg-surface/90 shadow-md">
          {clinics.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/clinics/${c.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-bg-soft">
                <Thumb image={c.image} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">
                    {c.name}
                    <UntranslatedNote translations={c.translations} />
                  </p>
                  <p className="truncate text-xs text-muted">
                    {c.chip} · Books “{label(c.serviceId)}”
                    {inHiddenSection(c.serviceId) ? " (in a hidden section, so this card doesn’t preselect it)" : ""}
                  </p>
                </div>
                <span className="text-xs text-muted">#{c.sortOrder}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
