"use client";

import { SiteErrorView } from "@/components/site/SiteErrorView";
import { en } from "@/lib/i18n/messages/en";

// Shown if the page cannot load its content (e.g. the database is unreachable).
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SiteErrorView t={en.error} reset={reset} />;
}
