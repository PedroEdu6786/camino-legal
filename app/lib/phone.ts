import { isSupportedCountry, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";

/** Explicit international prefixes take precedence; Mexico is only the initial default. */
export function parseContactPhone(value: string, country = "MX") {
  const input = value.trim();
  if (!input || input.length > 40 || !/^\+?[\d\s().-]+$/.test(input) || !isSupportedCountry(country)) return null;
  const parsed = parsePhoneNumberFromString(input, { defaultCountry: country as CountryCode, extract: false });
  return parsed?.isPossible() ? parsed : null;
}

export function normalizePhone(value: string, country = "MX") {
  return parseContactPhone(value, country)?.number ?? "";
}
