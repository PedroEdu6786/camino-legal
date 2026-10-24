type BrandLogoProps = {
  variant?: "symbol" | "complete";
  className?: string;
};

export default function BrandLogo({ variant = "complete", className = "" }: BrandLogoProps) {
  return <span role="img" aria-label="Camino Legal" className={`brand-logo brand-logo-${variant} ${className}`} />;
}
