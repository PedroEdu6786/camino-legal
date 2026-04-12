export default function Button({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`self-start rounded-md bg-button-bg px-4 py-2 text-sm font-semibold text-button-text transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 active:shadow-none ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}
