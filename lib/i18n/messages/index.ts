import type { Locale } from "../config";
import { ar } from "./ar";
import { en, type Messages } from "./en";
import { fr } from "./fr";

const MESSAGES: Record<Locale, Messages> = { en, fr, ar };

/** The public site's wording in one language. */
export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

export type { Messages };
