"use client";

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useBooking } from "./BookingProvider";
import { useI18n } from "./I18nProvider";

// Step-1 date picker, matching the service combobox. The value stays in the
// booking context, and the button keeps id="date" so validation can focus it.
export function DateListbox() {
  const booking = useBooking();
  const { t } = useI18n();
  const selected = booking.days.find((day) => day.value === booking.date) ?? null;
  const hasError = booking.errors.has("date");

  return (
    <Listbox value={booking.date} onChange={booking.setDate}>
      <ListboxButton id="date" className={"input listbox-button" + (hasError ? " is-error" : "")}>
        <span className={selected ? "listbox-value" : "listbox-value is-placeholder"}>
          {selected ? selected.label : t.booking.datePlaceholder}
        </span>
        <span className="combo-arrow" aria-hidden="true">
          <svg width="12" height="8" viewBox="0 0 12 8">
            <path
              d="M1 1.5l5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </ListboxButton>
      <ListboxOptions anchor="bottom start" transition className="combo-options">
        {booking.days.map((day) => (
          <ListboxOption key={day.value} value={day.value} className="combo-option">
            {day.label}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
