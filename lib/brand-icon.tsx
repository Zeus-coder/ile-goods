import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Monogram tile shared by the favicon and the Apple touch icon, set in the wordmark's serif.
export async function brandIcon(size: number, { rounded }: { rounded: boolean }) {
  const font = await readFile(join(process.cwd(), "assets/InstrumentSerif-Regular.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
          borderRadius: rounded ? size * 0.22 : 0,
          color: "#f7f6f3",
          fontFamily: "Instrument Serif",
          fontSize: size * 0.78,
          letterSpacing: "-0.04em",
          paddingBottom: size * 0.06,
        }}
      >
        Ié
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [{ name: "Instrument Serif", data: font, style: "normal", weight: 400 }],
    },
  );
}
