import type { HomeContent } from "@/lib/types";
import { AmbientGlow } from "./AmbientGlow";
import { BookingProvider } from "./BookingProvider";
import { GoogleReviewsSection } from "./GoogleReviews";
import { Hero } from "./Hero";
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

/** The public page, rendered from a content model (the live page reads it from MongoDB). */
export function HomePage({ content }: { content: HomeContent }) {
  return (
    <MotionProvider>
      <AmbientGlow />
      <ScrollProgress />
      <BookingProvider groups={content.bookingGroups} phone={content.settings.phone}>
        <SiteHeader nav={content.headerNav} phone={content.settings.phone} />
        <main id="top">
          <Hero settings={content.settings} sections={content.sections} />
          {content.sections.map((section) => (
            <ServiceSection key={section.category} section={section} />
          ))}
          <ClinicsSection clinics={content.clinics} />
          <StepsSection />
          <TeamSection doctors={content.doctors} />
          <WhySection />
          {content.reviewsEnabled ? <GoogleReviewsSection /> : null}
          <VisitSection settings={content.settings} />
        </main>
        <SiteFooter nav={content.nav} settings={content.settings} />
      </BookingProvider>
      <SmoothScroll />
    </MotionProvider>
  );
}
