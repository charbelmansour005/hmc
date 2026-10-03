"use client";

import { SiteErrorView } from "@/components/site/SiteErrorView";
import { ar } from "@/lib/i18n/messages/ar";

// Shown if the page cannot load its content (e.g. the database is unreachable).
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SiteErrorView t={ar.error} reset={reset} />;
}
