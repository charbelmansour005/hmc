import type { Metadata } from "next";
import Link from "next/link";
import { SectionVisibility, SectionVisibilityProvider } from "@/components/admin/SectionVisibility";
import { Thumb } from "@/components/admin/Thumb";
import { buttonClass, EmptyState, Notice, PageHeader, UntranslatedNote } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guard";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { listServices } from "@/lib/services";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  await requireAdmin("/admin/services");
  const [services, settings] = await Promise.all([listServices(), getSettings()]);
  const byId = new Map(services.map((s) => [s.id, s]));
  const hiddenSections = settings.hiddenSections;
  const isHidden = (id: string | null) => {
    const target = id ? byId.get(id) : undefined;
    return target ? hiddenSections.includes(target.category) : false;
  };

  return (
    <>
      <PageHeader
        title="Services"
        description="The cards in each section of the website. Order within a section follows the sort order. A whole section can be hidden from the website and shown again without losing its services."
        actions={
          <Link href="/admin/services/new" className={buttonClass.primary}>
            New service
          </Link>
        }
      />
      <SectionVisibilityProvider hiddenSections={hiddenSections}>
        <div className="grid gap-8">
          {CATEGORIES.map((category) => {
            const items = services.filter((s) => s.category === category);
            const heading = CATEGORY_META[category].heading;
            const hidden = hiddenSections.includes(category);
            return (
              <section key={category}>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                  <h2 className="text-xl text-ink">
                    {heading}
                    {hidden ? (
                      <span className="ml-3 rounded-pill bg-bg-soft px-2.5 py-1 align-middle font-sans text-xs font-semibold tracking-normal text-muted">
                        Hidden
                      </span>
                    ) : null}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <SectionVisibility category={category} name={heading} />
                    <Link href={`/admin/services/new?category=${category}`} className="text-sm font-semibold text-teal hover:underline">
                      Add to this section
                    </Link>
                  </div>
                </div>
                {hidden ? (
                  <div className="mb-3">
                    <Notice tone="info">
                      This section is hidden: the website doesn&apos;t show it, and visitors can&apos;t book its services.
                      Nothing is deleted.
                    </Notice>
                  </div>
                ) : null}
                {items.length === 0 ? (
                  <EmptyState>
                    {hidden
                      ? "No services in this section."
                      : "No services in this section, so it is hidden on the website."}
                  </EmptyState>
                ) : (
                  <ul
                    className={`divide-y divide-line overflow-hidden rounded-lg border border-white dark:border-white/10 bg-surface/90 shadow-md${hidden ? " opacity-60" : ""}`}
                  >
                    {items.map((s) => (
                      <li key={s.id}>
                        <Link href={`/admin/services/${s.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-bg-soft">
                          <Thumb image={s.image} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-ink">
                              {s.name}
                              {s.display === "feature" ? (
                                <span className="ml-2 rounded-pill bg-bg-soft px-2 py-0.5 text-xs font-semibold text-muted">Feature</span>
                              ) : null}
                              <UntranslatedNote translations={s.translations} />
                            </p>
                            <p className="truncate text-xs text-muted">
                              {s.chip ? `${s.chip} · ` : ""}
                              {s.bookAsId
                                ? `Books “${byId.get(s.bookAsId)?.bookingLabel ?? byId.get(s.bookAsId)?.name ?? "?"}”`
                                : `Booking: “${s.bookingLabel ?? s.name}”`}
                              {/* A card in a visible section can point at a service in a hidden one. */}
                              {!hidden && isHidden(s.bookAsId) ? " (in a hidden section, so this card doesn’t preselect it)" : ""}
                            </p>
                          </div>
                          <span className="text-xs text-muted">#{s.sortOrder}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </SectionVisibilityProvider>
    </>
  );
}
