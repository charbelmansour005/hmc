"use client";

import { SiteErrorView } from "@/components/site/SiteErrorView";
import { fr } from "@/lib/i18n/messages/fr";

// Shown if the page cannot load its content (e.g. the database is unreachable).
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SiteErrorView t={fr.error} reset={reset} />;
}
