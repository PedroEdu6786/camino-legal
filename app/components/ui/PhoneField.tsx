"use client";

import { useEffect, useRef, useState } from "react";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js/min";
import { parseContactPhone } from "../../lib/phone";
import phoneCountries from "../../lib/phoneCountries.json";
import styles from "./PhoneField.module.css";

// Fixed Spanish labels keep server and browser ICU versions from changing hydration order.
const countries = phoneCountries as { code: CountryCode; label: string }[];
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
      <input ref={input} id={id} name="phone" type="tel" inputMode="numeric" pattern="[0-9]+" autoComplete="tel-national" required maxLength={40}
        value={phone} onChange={event => {
          const value = event.target.value;
          if (value.trim().startsWith("+")) {
            const parsed = parseContactPhone(value, country);
            if (parsed?.country) {
              setCountry(parsed.country);
              setPhone(parsed.formatNational().replace(/\D/g, ""));
              return;
            }
          }
          setPhone(value.replace(/\D/g, "").slice(0, 15));
        }} placeholder="9991234567" aria-describedby={`${id}-hint`} className={styles.number} />
    </div>
    <p id={`${id}-hint`} className={styles.hint}>Elige tu país e ingresa tu número. También puedes pegar un número internacional.</p>
  </div>;
}
