import * as m from "framer-motion/m";
import Image from "next/image";
import { telHref } from "@/lib/home-content";
import { publicMapboxToken } from "@/lib/mapbox";
import { bookingWhatsApp } from "@/lib/phone";
import type { DoctorDTO, HomeSection, PublicClinicItem, SettingsDTO } from "@/lib/types";
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
    <m.div className="section-head" {...reveal} variants={cascade(0.1)}>
      <m.h2 variants={fadeUp}>{heading}</m.h2>
      {lede ? <m.p variants={fadeUp}>{lede}</m.p> : null}
    </m.div>
  );
}

export function ServiceSection({ section }: { section: HomeSection }) {
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
              <FeatureCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ClinicsSection({ clinics }: { clinics: PublicClinicItem[] }) {
  if (clinics.length === 0) return null;
  return (
    <section className="section" id="clinics">
      <div className="container">
        <SectionHead heading="Dedicated clinics" />
        <div className="grid grid--wide">
          {clinics.map((item) => (
            <ClinicCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { title: "Book", text: "Choose the team and time that suits you." },
  { title: "Visit", text: "Meet your clinician in our modern, welcoming center." },
  { title: "Follow up", text: "Leave with a clear, coordinated next step." },
];

export function StepsSection() {
  return (
    <section className="section" id="how">
      <div className="container">
        <SectionHead heading="How a visit works" />
        <ol className="steps">
          {STEPS.map((step, i) => (
            <RevealCard as="li" className="step" key={step.title}>
              <m.span className="step-num" variants={pop}>
                {i + 1}
              </m.span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </RevealCard>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function TeamSection({ doctors }: { doctors: DoctorDTO[] }) {
  if (doctors.length === 0) return null;
  return (
    <section className="section" id="team">
      <div className="container">
        <SectionHead heading="Meet the team" lede="Full team bios coming soon." />
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

const REASONS = [
  "Specialists, dentists and dietitians under one roof",
  "Straightforward, unhurried appointments",
  "In-house panoramic X-ray",
  "Care coordinated across every team",
];

export function WhySection() {
  return (
    <section className="section" id="why">
      <div className="container">
        <SectionHead heading="Why patients choose us" />
        <m.div className="why" {...reveal} variants={fadeUp}>
          <m.ul variants={cascade(0.12, 0.15)}>
            {REASONS.map((reason) => (
              <m.li key={reason} variants={slideIn}>
                <m.span className="check" aria-hidden="true" variants={pop}>
                  <svg viewBox="0 0 16 16">
                    <m.path
                      d="M3.5 8.5 6.5 11.5 12.5 4.5"
                      fill="none"
                      stroke="#fff"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      variants={draw}
                    />
                  </svg>
                </m.span>
                {reason}
              </m.li>
            ))}
          </m.ul>
        </m.div>
      </div>
    </section>
  );
}

export function VisitSection({ settings }: { settings: SettingsDTO }) {
  return (
    <section className="section" id="visit">
      <div className="container">
        <SectionHead heading="Visit us" />
        <m.div className="visit" {...reveal} variants={cascade(0.12)}>
          <AppointmentForm whatsapp={bookingWhatsApp(settings)} />

          <m.div className="panel" variants={fadeUp}>
            <ul className="contact-list">
              <li>
                <PinIcon aria-hidden />
                {settings.address ?? "[Address]"}
              </li>
              <li>
                <PhoneIcon aria-hidden />
                <a href={telHref(settings.phone)}>{settings.phone}</a>
              </li>
              {settings.email ? (
                <li>
                  <MailIcon aria-hidden />
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </li>
              ) : null}
              <li>
                <ClockIcon aria-hidden />
                {settings.openingHours ? <OpeningHours value={settings.openingHours} /> : "[Hours]"}
              </li>
            </ul>
            <div className="map">
              <LocationMap token={publicMapboxToken()} query={settings.mapQuery} address={settings.address} />
            </div>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
