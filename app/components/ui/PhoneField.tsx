"use client";

import { useEffect, useRef, useState } from "react";
import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js/min";
import { parseContactPhone } from "../../lib/phone";
import styles from "./PhoneField.module.css";

const regionNames = new Intl.DisplayNames(["es"], { type: "region" });
const countries = getCountries().map(code => ({ code, label: regionNames.of(code) ?? code }))
  .sort((a, b) => a.label.localeCompare(b.label, "es"));
const countryFlag = (code: string) => String.fromCodePoint(...[...code].map(letter => 127397 + letter.charCodeAt(0)));

export default function PhoneField({ id }: { id: string }) {
  const [country, setCountry] = useState<CountryCode>("MX");
  const [phone, setPhone] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.setCustomValidity(phone && !parseContactPhone(phone, country)
      ? "Revisa el número y el país seleccionado, o escribe el número completo con + y su código de país." : "");
  }, [phone, country]);

  return <div className={styles.field}>
    <div className={styles.controls}>
      <label htmlFor={`${id}-country`} className="sr-only">País o región del teléfono</label>
      <div className={styles.countryControl}>
        <span className={styles.countryDisplay} aria-hidden="true">
          <span>{countryFlag(country)}</span><span>+{getCountryCallingCode(country)}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="m1 1 4 4 4-4" stroke="currentColor" strokeWidth="1.5" /></svg>
        </span>
        <select id={`${id}-country`} name="phoneCountry" value={country} onChange={event => setCountry(event.target.value as CountryCode)} autoComplete="country" className={styles.country}>
          {countries.map(({ code, label }) => <option key={code} value={code}>{countryFlag(code)} +{getCountryCallingCode(code)} · {label}</option>)}
        </select>
      </div>
      <input ref={input} id={id} name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={40}
        value={phone} onChange={event => {
          const value = event.target.value;
          setPhone(value);
          if (value.trim().startsWith("+")) {
            const parsed = parseContactPhone(value, country);
            if (parsed?.country) setCountry(parsed.country);
          }
        }} placeholder="Tu número de teléfono" aria-describedby={`${id}-hint`} className={styles.number} />
    </div>
    <p id={`${id}-hint`} className={styles.hint}>Elige tu país o escribe el número completo con + y su código.</p>
  </div>;
}
