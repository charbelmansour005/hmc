import { dirOf, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import type { HomeContent } from "@/lib/types";
import { AmbientGlow } from "./AmbientGlow";
import { BookingProvider } from "./BookingProvider";
import { GoogleReviewsSection } from "./GoogleReviews";
import { Hero } from "./Hero";
import { I18nProvider } from "./I18nProvider";
import { MotionProvider } from "./motion/MotionProvider";
import { ScrollProgress } from "./ScrollProgress";
import {
  ClinicsSection,
  ServiceSection,
  StepsSection,
  TeamSection,
  VisitSection,
  WhySection,
} from "./Sections";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SmoothScroll } from "./SmoothScroll";

/**
 * The public page in one language, rendered from a content model (the live
 * page reads it from MongoDB). Server components take the wording as `t`;
 * client components read it from I18nProvider.
 */
export function HomePage({ content, locale }: { content: HomeContent; locale: Locale }) {
  const t = getMessages(locale);
  return (
    <I18nProvider locale={locale} messages={t}>
      <MotionProvider>
        <AmbientGlow />
        <ScrollProgress />
        <BookingProvider groups={content.bookingGroups} phone={content.settings.phone}>
          <SiteHeader nav={content.headerNav} phone={content.settings.phone} />
          <main id="top">
            <Hero settings={content.settings} sections={content.sections} locale={locale} t={t} />
            {content.sections.map((section) => (
              <ServiceSection key={section.category} section={section} t={t} />
            ))}
            <ClinicsSection clinics={content.clinics} t={t} />
            <StepsSection t={t} />
            <TeamSection doctors={content.doctors} t={t} />
            <WhySection t={t} dir={dirOf(locale)} />
            {content.reviewsEnabled ? <GoogleReviewsSection /> : null}
            <VisitSection settings={content.settings} t={t} />
          </main>
          <SiteFooter nav={content.nav} settings={content.settings} t={t} />
        </BookingProvider>
        <SmoothScroll />
      </MotionProvider>
    </I18nProvider>
  );
}
