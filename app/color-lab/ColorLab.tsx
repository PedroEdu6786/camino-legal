"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Full navigation is required to apply or clear the beforeInteractive preview. */

import { useId, useState, type CSSProperties } from "react";
import Image from "next/image";
import { HeroIconFilter } from "../components/ui/StickerInk";
import { contrast, getTheme, editableColors, validHex, type ColorOverrides, type EditableColor, type Theme } from "./themes";
import styles from "./color-lab.module.css";

const services = [
  { title: "Registro de marca", copy: "Dale a tu marca un lugar propio. Te acompañamos en su registro ante el IMPI.", image: "81" },
  { title: "Derechos de autor", copy: "Protege las ideas que ya convertiste en obras y el trabajo que llevan detrás.", image: "85" },
  { title: "Contratos y convenios", copy: "Acuerdos claros para que tu proyecto avance con tranquilidad.", image: "84" },
];

function Preview({ theme, label }: { theme: Theme; label: string }) {
  const heroFilterId = `hero-preview-${useId().replace(/:/g, "")}`;
  const variables = { "--preview-bg": theme.background, "--preview-card": theme.surface, "--preview-action": theme.action, "--preview-ink": theme.ink, "--preview-field": theme.field, "--preview-accent": theme.accent, "--preview-footer": theme.footer, "--preview-highlight": theme.highlight, "--preview-hero": theme.hero, "--preview-heading": theme.heading, "--preview-button-text": theme.buttonText, "--preview-footer-text": theme.footerText, "--preview-logo": theme.logo } as CSSProperties;
  return <section className={styles.preview} style={variables} aria-label={label} data-tonal={theme.background === theme.surface}>
    <div className={styles.previewCaption}>{label} · {theme.name}</div>
    <div className={styles.sampleNav}>
      <span className={styles.logo} role="img" aria-label="Camino Legal" />
      <span>Servicios legales · México</span>
    </div>
    <div className={styles.hero}>
      <svg aria-hidden="true" width="0" height="0" className={styles.filterDefs}><defs><HeroIconFilter id={heroFilterId} color={theme.heroIcons} /></defs></svg>
      <div className={styles.heroIcons} aria-hidden="true">
        {["93", "91", "84", "85"].map(resource => <Image key={resource} src={`/stickers/Recurso ${resource}.png`} alt="" width={46} height={46} style={{ filter: `url(#${heroFilterId})` }} />)}
      </div>
      <h2>El camino se hace<br />al decidir <em>avanzar.</em></h2>
      <p>Acompañamiento legal para artistas, personas creadoras y negocios.</p>
      <div className={styles.actions}>
        <a href="#muestras" className={styles.primary}>Explorar servicios <span aria-hidden="true">↗</span></a>
        <a href="#preguntas-lab" className={styles.secondary}>Conoce el proceso</a>
      </div>
      <svg className={styles.curve} viewBox="0 0 900 90" fill="none" aria-hidden="true"><path d="M-20 70C170-65 245 160 460 45S730 15 940 65" stroke="currentColor" strokeWidth="2" /></svg>
    </div>
    <div className={styles.services}>
      <h3>Protege lo que estás creando.</h3>
      <div className={styles.cards}>
        {services.map(service => <article className={styles.card} key={service.title}>
          <Image src={`/stickers/Recurso ${service.image}.png`} alt="" width={90} height={90} loading="eager" className={styles.sticker} />
          <h4>{service.title}</h4><p>{service.copy}</p>
          <a href="#preguntas-lab">Conocer más <span aria-hidden="true">→</span></a>
        </article>)}
      </div>
      <div className={styles.wideCard}>
        <div><h3>Tu idea.<br />Nuestro equipo.</h3><p>Cuéntanos en qué etapa está tu proyecto.</p></div>
        <a href="#preguntas-lab" className={styles.primary}>Empecemos <span aria-hidden="true">↗</span></a>
      </div>
      <details className={styles.faq}><summary>¿Por dónde empiezo?</summary><p>Primero identificamos qué necesitas proteger y resolvemos tus dudas. Después trazamos el camino legal de tu proyecto.</p></details>
    </div>
    <footer className={styles.sampleFooter}><span>Camino Legal®</span><p>Contigo, de la idea al siguiente paso.</p></footer>
  </section>;
}

function ColorControl({ label, value, original, onChange }: {
  label: string; value: string; original: string; onChange: (value: string) => void;
}) {
  const [input, setInput] = useState<string | null>(null);
  const invalid = input !== null && !validHex(input);
  return <div className={styles.colorControl}>
    <label><span>{label}</span><input type="color" aria-label={label} value={value} onChange={event => { setInput(null); onChange(event.target.value.toUpperCase()); }} /></label>
    <div className={styles.hexRow}>
      <input type="text" aria-label={`${label}: hexadecimal`} value={input ?? value} spellCheck={false} maxLength={7} aria-invalid={invalid} onBlur={() => setInput(null)} onChange={event => {
        const next = event.target.value; setInput(next);
        if (validHex(next)) onChange(next.toUpperCase());
      }} />
      <button type="button" aria-label={`Restablecer ${label}`} disabled={value === original} onClick={() => { setInput(null); onChange(original); }}>↺</button>
    </div>
    {invalid && <small>Usa # y seis caracteres hexadecimales.</small>}
  </div>;
}

export default function ColorLab({ initialEditable, initialCompare, initialOverrides }: {
  initialEditable: boolean; initialCompare: boolean; initialOverrides: ColorOverrides;
}) {
  const original = getTheme("linen");
  const [editing, setEditing] = useState(initialEditable);
  const [compare, setCompare] = useState(initialCompare);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [copied, setCopied] = useState(false);
  const draft: Theme = { ...original, ...overrides, id: "linen-custom", name: "Lino y azul · mi versión", note: "Tu copia editable. Cambia cada componente sin modificar el original." };
  const theme = editing ? draft : original;
  const previewParams = new URLSearchParams({ preview: editing ? "custom" : "original" });
  if (editing) for (const { key } of editableColors) if (overrides[key]) previewParams.set(key, overrides[key]);
  function updateUrl(edit: boolean, comparison: boolean, colors: ColorOverrides) {
    const params = new URLSearchParams({ theme: edit ? "linen-custom" : "linen" });
    if (comparison) params.set("compare", "linen");
    for (const { key } of editableColors) if (colors[key] && colors[key] !== original[key]) params.set(key, colors[key]);
    window.history.replaceState(null, "", `?${params}`);
    setCopied(false);
  }
  function changeColor(key: EditableColor, value: string) {
    const next = { ...overrides, [key]: value };
    if (value === original[key]) delete next[key];
    setOverrides(next); updateUrl(true, compare, next);
  }
  async function copyLink() {
    updateUrl(editing, compare, overrides);
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); }
    catch { window.prompt("Copia el enlace:", window.location.href); }
  }
  const pairs = [
    ["Texto / fondo", theme.ink, theme.background],
    ["Texto / tarjetas", theme.ink, theme.surface],
    ["Texto / portada", theme.ink, theme.hero],
    ["Texto / panel", theme.ink, theme.field],
    ["Títulos / portada", theme.heading, theme.hero],
    ["Títulos / tarjetas", theme.heading, theme.surface],
    ["Enlaces / fondo", theme.accent, theme.background],
    ["Enlaces / tarjetas", theme.accent, theme.surface],
    ["Texto / botón", theme.buttonText, theme.action],
    ["Texto / pie", theme.footerText, theme.footer],
  ];
  const lowContrast = pairs.filter(([, text, background]) => Number(contrast(text, background)) < 4.5);
  return <main className={styles.lab} data-color-lab>
    <header className={styles.toolbar}>
      <div><span className={styles.brand}>Camino Legal</span><h1>Explorador · Lino y azul</h1></div>
      <button type="button" onClick={copyLink}>{copied ? "Enlace copiado" : "Copiar mi versión ↗"}</button>
    </header>
    <div className={styles.workspace}>
      <aside className={styles.controls} aria-label="Editor de colores">
        <p className={styles.intro}>El original y tu versión.</p>
        <p className={styles.helper}>Elige tu copia para cambiar colores por componente. El original se conserva como referencia.</p>
        <div className={styles.themeList}>
          {[false, true].map(edit => <button key={String(edit)} type="button" className={styles.themeButton} aria-pressed={editing === edit} onClick={() => { setEditing(edit); updateUrl(edit, compare, overrides); }}>
            {edit ? "Lino y azul · mi versión" : "Lino y azul · original"}
          </button>)}
        </div>
        <label className={styles.compareToggle}><input type="checkbox" checked={compare} onChange={event => { setCompare(event.target.checked); updateUrl(editing, event.target.checked, overrides); }} />Comparar con el original</label>
        {editing ? <fieldset className={styles.colorEditor}>
          <legend>Colores por componente</legend>
          {editableColors.map(({ key, label }) => <ColorControl key={key} label={label} value={draft[key]} original={original[key]} onChange={value => changeColor(key, value)} />)}
          <button className={styles.resetAll} type="button" disabled={Object.keys(overrides).length === 0} onClick={() => { setOverrides({}); updateUrl(true, compare, {}); }}>Restablecer todos los colores</button>
        </fieldset> : <p className={styles.helper}>Esta es la versión original. Selecciona “mi versión” para editar; tus cambios se conservan al alternar.</p>}
      </aside>
      <div className={styles.canvas}>
        <div className={styles.selection} aria-live="polite"><h2>{theme.name}</h2><p>{theme.note}</p></div>
        <div className={styles.tokenRow}>{pairs.map(([label, text, background]) => <span key={label}>{label} <b>{contrast(text, background)}:1</b></span>)}</div>
        {lowContrast.length > 0 && <p className={styles.contrastWarning} role="status">Contraste menor a 4.5:1: {lowContrast.map(([label]) => label).join(", ")}. Ajusta estos pares para facilitar la lectura.</p>}
        <a className={styles.openSite} href={`/?${previewParams}`}>Previsualizar en la página principal ↗</a>
        <div id="muestras" className={`${styles.previews} ${compare ? styles.comparing : ""}`}>
          <Preview theme={theme} label={editing ? "Tu versión" : "Original"} />
          {compare && <Preview theme={original} label="Referencia sin cambios" />}
        </div>
        <p id="preguntas-lab" className={styles.footnote}>Previsualiza tus colores en la página principal y recorre el sitio. La vista previa se conserva en esta pestaña; puedes volver a editar o restaurar el original. Copia el enlace para guardar tu versión.</p>
        <a className={styles.openSite} href="/?preview=original">Ver el sitio original ↗</a>
      </div>
    </div>
  </main>;
}
