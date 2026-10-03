"use client";

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useMemo, useState } from "react";
import { fmt } from "@/lib/i18n/format";
import type { BookingOption } from "@/lib/types";
import { useBooking } from "./BookingProvider";
import { useI18n } from "./I18nProvider";

/** Lower-cased and without accents or Arabic vowel marks, so "esthetique" finds "Esthétique". */
const fold = (value: string) => value.normalize("NFD").replace(/\p{M}+/gu, "").toLowerCase();

// Step-1 service picker. Replaces the native <select> with a searchable,
// grouped combobox: 39 services across 5 categories, filterable by typing.
// Value/selection stay in the booking context (serviceId), so the card
// preselect and validation keep working. Styling reuses the .input tokens,
// so light and dark themes are handled by the shared CSS.
export function ServiceCombobox() {
  const booking = useBooking();
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const selected = useMemo(() => {
    for (const group of booking.groups) {
      const found = group.options.find((option) => option.id === booking.serviceId);
      if (found) return found;
    }
    return null;
  }, [booking.groups, booking.serviceId]);

  const q = fold(query.trim());
  const groups = useMemo(() => {
    if (!q) return booking.groups;
    // A service is also found by its English name, whatever the page's language.
    return booking.groups
      .map((group) => ({
        ...group,
        options: group.options.filter(
          (option) => fold(option.label).includes(q) || fold(option.labelEn).includes(q),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [booking.groups, q]);

  const hasError = booking.errors.has("service");

  return (
    <Combobox
      value={selected}
      by="id"
      immediate
      onChange={(option: BookingOption | null) => booking.setServiceId(option?.id ?? "")}
      onClose={() => setQuery("")}
    >
      <div className="combo">
        <ComboboxInput
          id="service"
          className={"input combo-input" + (hasError ? " is-error" : "")}
          placeholder={t.booking.servicePlaceholder}
          autoComplete="off"
          spellCheck={false}
          aria-label={t.booking.service}
          displayValue={(option: BookingOption | null) => option?.label ?? ""}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ComboboxButton className="combo-arrow" aria-label={t.booking.showServices}>
          <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
            <path
              d="M1 1.5l5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ComboboxButton>
        <ComboboxOptions anchor="bottom start" transition className="combo-options">
          {groups.length === 0 ? (
            <div className="combo-empty">{fmt(t.booking.noMatch, { query: query.trim() })}</div>
          ) : (
            groups.map((group) => (
              <div className="combo-group" key={group.label}>
                <div className="combo-group-label">{group.label}</div>
                {group.options.map((option) => (
                  <ComboboxOption key={option.id} value={option} className="combo-option">
                    {option.label}
                  </ComboboxOption>
                ))}
              </div>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
