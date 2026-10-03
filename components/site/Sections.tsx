import * as motion from "motion/react-client";
import Image from "next/image";
import { telHref } from "@/lib/home-content";
import type { Messages } from "@/lib/i18n/messages/en";
import { publicMapboxToken } from "@/lib/mapbox";
import { bookingWhatsApp } from "@/lib/phone";
import type { HomeSection, PublicClinicItem, PublicDoctor, PublicSettings } from "@/lib/types";
import { AppointmentForm } from "./AppointmentForm";
import { ClinicCard, FeatureCard, ServiceCard } from "./Cards";
import { RevealCard } from "./RevealCard";
import { ClockIcon, MailIcon, PersonSilhouette, PhoneIcon, PinIcon } from "./icons";
import { LocationMap } from "./LocationMap";
import { OpeningHours } from "./OpeningHours";
import { cascade, draw, fadeUp, pop, slideIn, VIEWPORT } from "./motion/variants";

// Section heads and single blocks reveal once as they scroll into view
// (initial="hidden" -> whileInView="show"); children inherit the labels and
// stagger in. Cards reveal individually instead (TiltCard / RevealCard), so a
// tall grid keeps fading in row by row as you scroll down it.
const reveal = { initial: "hidden", whileInView: "show", viewport: VIEWPORT } as const;

function SectionHead({ heading, lede }: { heading: string; lede?: string | null }) {
  return (
    <motion.div className="section-head" {...reveal} variants={cascade(0.1)}>
      <motion.h2 variants={fadeUp}>{heading}</motion.h2>
      {lede ? <motion.p variants={fadeUp}>{lede}</motion.p> : null}
    </motion.div>
  );
}

export function ServiceSection({ section, t }: { section: HomeSection; t: Messages }) {
  return (
    <section className="section" id={section.anchor}>
      <div className="container">
        <SectionHead heading={section.heading} lede={section.lede} />
        {section.cards.length > 0 ? (
          <div className={section.wide ? "grid grid--wide" : "grid"}>
            {section.cards.map((item) => (
              <ServiceCard key={item.id} item={item} wide={section.wide} />
            ))}
          </div>
        ) : null}
        {section.features.length > 0 ? (
          <div className="features">
            {section.features.map((item) => (
              <FeatureCard key={item.id} item={item} t={t} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ClinicsSection({ clinics, t }: { clinics: PublicClinicItem[]; t: Messages }) {
  if (clinics.length === 0) return null;
  return (
    <section className="section" id="clinics">
      <div className="container">
        <SectionHead heading={t.sections.clinics} />
        <div className="grid grid--wide">
          {clinics.map((item) => (
            <ClinicCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function StepsSection({ t }: { t: Messages }) {
  return (
    <section className="section" id="how">
      <div className="container">
        <SectionHead heading={t.sections.steps} />
        <ol className="steps">
          {t.sections.stepsList.map((step, i) => (
            <RevealCard as="li" className="step" key={step.title}>
              <motion.span className="step-num" variants={pop}>
                {i + 1}
              </motion.span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </RevealCard>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function TeamSection({ doctors, t }: { doctors: PublicDoctor[]; t: Messages }) {
  if (doctors.length === 0) return null;
  return (
    <section className="section" id="team">
      <div className="container">
        <SectionHead heading={t.sections.team} lede={t.sections.teamLede} />
        <div className="team">
          {doctors.map((doctor) => (
            <RevealCard as="article" className="member" key={doctor.id}>
              {doctor.photo ? (
                <div className={`avatar avatar--${doctor.accent} avatar--photo`}>
                  <Image
                    src={doctor.photo.url}
                    alt={doctor.photo.alt}
                    width={580}
                    height={464}
                    sizes="(max-width: 820px) 50vw, 290px"
                    unoptimized={doctor.photo.storage === "external"}
                  />
                </div>
              ) : (
                <div className={`avatar avatar--${doctor.accent}`} aria-hidden="true">
                  <PersonSilhouette />
                </div>
              )}
              <h3>{doctor.name}</h3>
              <p className={`role--${doctor.accent}`}>
                {doctor.bio ? `${doctor.specialty} – ${doctor.bio}` : doctor.specialty}
              </p>
            </RevealCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhySection({ t, dir }: { t: Messages; dir: "ltr" | "rtl" }) {
  return (
    <section className="section" id="why">
      <div className="container">
        <SectionHead heading={t.sections.why} />
        <motion.div className="why" {...reveal} variants={fadeUp}>
          <motion.ul variants={cascade(0.12, 0.15)}>
            {t.sections.reasons.map((reason) => (
              <motion.li key={reason} variants={slideIn(dir)}>
                <motion.span className="check" aria-hidden="true" variants={pop}>
                  <svg viewBox="0 0 16 16">
                    <motion.path
                      d="M3.5 8.5 6.5 11.5 12.5 4.5"
                      fill="none"
                      stroke="#fff"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      variants={draw}
                    />
                  </svg>
                </motion.span>
                {reason}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}

export function VisitSection({ settings, t }: { settings: PublicSettings; t: Messages }) {
  return (
    <section className="section" id="visit">
      <div className="container">
        <SectionHead heading={t.sections.visit} />
        <motion.div className="visit" {...reveal} variants={cascade(0.12)}>
          <AppointmentForm whatsapp={bookingWhatsApp(settings)} />

          <motion.div className="panel" variants={fadeUp}>
            <ul className="contact-list">
              <li>
                <PinIcon aria-hidden />
                {settings.address ?? t.sections.addressPlaceholder}
              </li>
              <li>
                <PhoneIcon aria-hidden />
                <a href={telHref(settings.phone)} dir="ltr">
                  {settings.phone}
                </a>
              </li>
              {settings.email ? (
                <li>
                  <MailIcon aria-hidden />
                  <a href={`mailto:${settings.email}`} dir="ltr">
                    {settings.email}
                  </a>
                </li>
              ) : null}
              <li>
                <ClockIcon aria-hidden />
                {settings.openingHours ? <OpeningHours value={settings.openingHours} /> : t.sections.hoursPlaceholder}
              </li>
            </ul>
            <div className="map">
              <LocationMap token={publicMapboxToken()} query={settings.mapQuery} address={settings.address} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
