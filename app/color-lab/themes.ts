export type Theme = {
  id: string; name: string; note: string;
  background: string; surface: string; action: string; ink: string; field: string; accent: string; footer: string; highlight: string; hero: string; heading: string; buttonText: string; footerText: string; logo: string; heroIcons: string;
};

export const brandColors = {
  Lino: "#F2ECEA", Papel: "#FFF8F3", Azul: "#D1E7F4",
  Vino: "#622831", Naranja: "#CB5432", Carbón: "#2F2A2B",
};

export const themes: Theme[] = [{
  id: "linen", name: "Lino y azul", note: "La versión elegida: fondo lino, tarjetas de papel, azul suave y botones tinto. Los demás acentos y los colores propios de los servicios se conservan.",
  background: "#F2ECEA", surface: "#FFF8F3", field: "#D1E7F4",
  ink: "#2F2A2B", accent: "#622831", footer: "#622831",
  heading: "#2F2A2B", buttonText: "#FFF8F3", footerText: "#FFF8F3", logo: "#CB5432", heroIcons: "#CB5432",
  action: "#7D0402", highlight: "#BB4D2E", hero: "#F2ECEA",
}];

export function getTheme(id: string | undefined) {
  return themes.find(theme => theme.id === id) ?? themes[0];
}

export function getInitialBackground(id: string | undefined) {
  return getTheme(id).background;
}

export function themeVariables(theme: Theme): Record<string, string> {
  return { "--background": theme.background, "--surface": theme.surface, "--brand-blue": theme.field,
    "--foreground": theme.ink, "--primary": theme.accent, "--secondary": theme.highlight, "--hero-bg": theme.hero,
    "--button-bg": theme.action, "--button-text": brandColors.Papel, "--nav-active": theme.field,
    "--curve": theme.action, "--brand-burgundy": theme.footer };
}

export function validHex(value: string | undefined) {
  return value && /^#[\da-f]{6}$/i.test(value) ? value : undefined;
}

export function contrast(first: string, second: string) {
  const luminance = (hex: string) => {
    const rgb = [1, 3, 5].map(offset => {
      const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const a = luminance(first);
  const b = luminance(second);
  return ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2);
}

export const editableColors = [
  { key: "background", label: "Fondo de página" },
  { key: "hero", label: "Fondo de portada" },
  { key: "surface", label: "Tarjetas" },
  { key: "field", label: "Panel de invitación" },
  { key: "ink", label: "Texto general" },
  { key: "heading", label: "Títulos" },
  { key: "highlight", label: "Palabras destacadas" },
  { key: "accent", label: "Enlaces" },
  { key: "action", label: "Fondo de botones" },
  { key: "buttonText", label: "Texto de botones" },
  { key: "footer", label: "Fondo del pie" },
  { key: "footerText", label: "Texto del pie" },
  { key: "logo", label: "Logo" },
  { key: "heroIcons", label: "Iconos flotantes de portada" },
] as const;
export type EditableColor = (typeof editableColors)[number]["key"];
export type ColorOverrides = Partial<Pick<Theme, EditableColor>>;

export function readOverrides(params: Record<string, string | string[] | undefined>): ColorOverrides {
  const result: ColorOverrides = {};
  for (const { key } of editableColors) {
    const raw = params[key];
    const color = validHex(typeof raw === "string" ? raw : undefined);
    if (color) result[key] = color.toUpperCase();
  }
  return result;
}
