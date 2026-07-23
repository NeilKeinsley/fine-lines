import type { GarmentType } from "@/lib/products";

/*
  Every product image is stroke-drawn line art — the "fine lines" brand motif.
  Paths carry pathLength=1 so CSS can animate stroke-dashoffset (draw/redraw).
*/
const ART: Record<GarmentType, { paths: string[]; circles?: [number, number][] }> = {
  tee: {
    paths: [
      "M38 26 L50 20 Q60 27 70 20 L82 26 L100 44 L88 56 L86 120 L34 120 L32 56 L20 44 Z",
      "M50 20 Q60 32 70 20",
      "M32 56 L37 50 M88 56 L83 50",
      "M36 112 L84 112",
    ],
  },
  shirt: {
    paths: [
      "M38 26 L52 20 L60 30 L68 20 L82 26 L98 44 L87 55 L86 120 L34 120 L33 55 L22 44 Z",
      "M52 20 L58 34 L60 30 L62 34 L68 20",
      "M60 34 L60 118",
      "M42 62 H54 V74 H42 Z",
    ],
    circles: [
      [64, 46],
      [64, 62],
      [64, 78],
      [64, 94],
    ],
  },
  jacket: {
    paths: [
      "M36 28 L52 22 L60 30 L68 22 L84 28 L102 46 L90 58 L90 122 L30 122 L30 58 L18 46 Z",
      "M58 32 L58 122 M62 32 L62 122",
      "M52 22 L58 32 M68 22 L62 32",
      "M36 88 H50 V104 H36 Z M70 88 H84 V104 H70 Z",
      "M40 52 H50 V64 H40 Z",
    ],
  },
  coat: {
    paths: [
      "M40 24 L54 18 L60 28 L66 18 L80 24 L96 44 L86 54 L88 132 L32 132 L34 54 L24 44 Z",
      "M54 18 L60 44 L66 18",
      "M60 44 L60 132",
      "M34 78 L86 78 M56 74 H64 V82 H56 Z",
      "M42 92 L48 104 M78 92 L72 104",
    ],
  },
  dress: {
    paths: [
      "M48 18 L46 30 M72 18 L74 30",
      "M46 30 Q60 40 74 30",
      "M46 30 L42 62 L30 124 L90 124 L78 62 L74 30",
      "M44 60 Q60 67 76 60",
    ],
  },
  skirt: {
    paths: [
      "M38 30 H82 M38 36 H82",
      "M38 36 L26 122 L94 122 L82 36",
      "M50 36 L44 122 M60 36 L60 122 M70 36 L76 122",
    ],
  },
  trousers: {
    paths: [
      "M38 24 H82 V32 H38 Z",
      "M38 32 L34 128 L54 128 L58 60 L62 60 L66 128 L86 128 L82 32",
      "M46 44 L44 120 M74 44 L76 120",
      "M60 32 L60 48",
    ],
  },
  sweater: {
    paths: [
      "M36 28 L50 22 Q60 30 70 22 L84 28 L100 46 L88 58 L86 114 L34 114 L32 58 L20 46 Z",
      "M50 22 Q60 34 70 22 M52 25 Q60 36 68 25",
      "M34 114 L86 114 M34 122 L86 122 M34 114 L34 122 M86 114 L86 122",
      "M42 114 L42 122 M50 114 L50 122 M58 114 L58 122 M66 114 L66 122 M74 114 L74 122",
    ],
  },
  blazer: {
    paths: [
      "M38 26 L54 20 L60 34 L66 20 L82 26 L98 46 L88 56 L88 124 L32 124 L32 56 L22 46 Z",
      "M54 20 L48 48 L60 66 M66 20 L72 48 L60 66",
      "M60 66 L60 124",
      "M38 92 H52 M68 92 H82",
      "M42 58 H52",
    ],
    circles: [[60, 78]],
  },
};

export function GarmentArt({
  type,
  className,
  autodraw = false,
}: {
  type: GarmentType;
  className?: string;
  autodraw?: boolean;
}) {
  const art = ART[type];
  return (
    <svg
      viewBox="0 0 120 140"
      className={`garment ${autodraw ? "garment-autodraw" : ""} ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {art.paths.map((d, i) => (
        <path key={i} d={d} pathLength={1} style={{ ["--draw-index" as string]: i }} />
      ))}
      {art.circles?.map(([cx, cy], i) => (
        <circle
          key={`c${i}`}
          cx={cx}
          cy={cy}
          r={1.8}
          pathLength={1}
          style={{ ["--draw-index" as string]: art.paths.length + i }}
        />
      ))}
    </svg>
  );
}
