import { Manrope } from "next/font/google";
import localFont from "next/font/local";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans-latin",
  display: "swap",
});

const theSans = localFont({
  variable: "--font-sans-arabic",
  display: "swap",
  src: [
    { path: "../../public/fonts/TheSans Light.otf", weight: "300", style: "normal" },
    { path: "../../public/fonts/TheSans.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/TheSans.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/TheSans Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/TheSans Bold.ttf", weight: "800", style: "normal" },
  ],
});

export const display = {
  variable: `${manrope.variable} ${theSans.variable}`,
};
