import { Fredoka, Poppins, Nanum_Pen_Script } from "next/font/google"

export const fontFredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  adjustFontFallback: false,
})

export const fontPoppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-poppins",
  adjustFontFallback: false,
})

export const fontNanumPen = Nanum_Pen_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-nanum-pen",
  adjustFontFallback: false,
})
