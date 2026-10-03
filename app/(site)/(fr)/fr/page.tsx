import { HomePage } from "@/components/site/HomePage";
import { getHomeContent } from "@/lib/home";

// Content is edited in the CMS: render on every request, never at build time.
export const dynamic = "force-dynamic";

export default async function Page() {
  return <HomePage locale="fr" content={await getHomeContent("fr")} />;
}
