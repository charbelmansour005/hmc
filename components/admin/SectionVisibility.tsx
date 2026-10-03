"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useTransition } from "react";
import type { Category } from "@/lib/categories";
import type { SettingsDTO } from "@/lib/types";
import { sendJson } from "./api";

// Showing and hiding service sections on the website (Settings.hiddenSections).
// Nothing is deleted: a hidden section keeps its services here in the CMS.

type Visibility = {
  hidden: Category[];
  /** The section being saved, until the page shows the new state. */
  saving: Category | null;
  failed: { category: Category; message: string } | null;
  toggle: (category: Category) => void;
};

const VisibilityContext = createContext<Visibility | null>(null);

/**
 * Wraps the sections of the Services page. The switches share one state, so
 * they all wait while one change is saved and the page reloads its data:
 * each save sends the whole list, which must not be built from a stale one.
 */
export function SectionVisibilityProvider({
  hiddenSections,
  children,
}: {
  /** The sections hidden right now, as stored. */
  hiddenSections: Category[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [saving, setSaving] = useState<Category | null>(null);
  const [failed, setFailed] = useState<Visibility["failed"]>(null);

  // The save is over once the refreshed page (with the new list) has arrived.
  useEffect(() => {
    if (!refreshing) setSaving(null);
  }, [refreshing]);

  const toggle = async (category: Category) => {
    if (saving) return;
    setSaving(category);
    setFailed(null);
    const next = hiddenSections.includes(category)
      ? hiddenSections.filter((c) => c !== category)
      : [...hiddenSections, category];
    const result = await sendJson<SettingsDTO>("/api/admin/settings", "PATCH", { hiddenSections: next });
    if (!result.ok) {
      setFailed({ category, message: result.message });
      setSaving(null);
      return;
    }
    startRefresh(() => router.refresh());
  };

  return (
    <VisibilityContext.Provider value={{ hidden: hiddenSections, saving, failed, toggle }}>
      {children}
    </VisibilityContext.Provider>
  );
}

/** The switch for one section. `name` is the section's heading, for screen readers. */
export function SectionVisibility({ category, name }: { category: Category; name: string }) {
  const ctx = useContext(VisibilityContext);
  if (!ctx) throw new Error("SectionVisibility must be used inside <SectionVisibilityProvider>");
  const hidden = ctx.hidden.includes(category);
  const failed = ctx.failed?.category === category ? ctx.failed.message : null;

  return (
    <>
      <button
        type="button"
        onClick={() => ctx.toggle(category)}
        disabled={ctx.saving !== null}
        aria-label={`${hidden ? "Show" : "Hide"} “${name}” on the website`}
        className="text-sm font-semibold text-teal hover:underline disabled:cursor-progress disabled:opacity-60"
      >
        {ctx.saving === category ? "Saving…" : hidden ? "Show on website" : "Hide from website"}
      </button>
      {failed ? (
        <span role="alert" className="text-xs font-medium text-danger">
          {failed}
        </span>
      ) : null}
    </>
  );
}
