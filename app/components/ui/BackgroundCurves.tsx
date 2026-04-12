export default function BackgroundCurves() {
  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10"
      viewBox="0 0 1200 800"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        d="M-100 300 C200 100, 400 500, 700 250 S1100 400, 1400 200"
        stroke="#E2D9D5"
        strokeWidth="1.5"
        opacity="0.35"
      />
      <path
        d="M-50 500 C150 350, 450 650, 750 400 S1050 550, 1350 350"
        stroke="#E2D9D5"
        strokeWidth="1"
        opacity="0.35"
      />
      <path
        d="M-200 150 C100 50, 350 300, 600 150 S900 250, 1300 100"
        stroke="#E2D9D5"
        strokeWidth="2"
        opacity="0.35"
      />
      <path
        d="M0 650 C300 500, 500 750, 800 600 S1100 700, 1400 550"
        stroke="#E2D9D5"
        strokeWidth="1"
        opacity="0.35"
      />
      <path
        d="M-150 450 C100 300, 350 550, 650 350 S950 500, 1300 300"
        stroke="#E2D9D5"
        strokeWidth="1.5"
        opacity="0.35"
      />
    </svg>
  );
}
