import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://capturia.app"),
  title: "Capturia · Gráficos profesionales en tu cámara, solo hablando",
  description:
    "Di tus números, tu nombre, tu mensaje, y Capturia pone gráficos profesionales en tu cámara al instante. Para emprendedores, presentadores y creadores en Zoom, Teams y Meet. Gratis para empezar.",
  openGraph: {
    title: "Capturia · Gráficos profesionales en tu cámara, solo hablando",
    description:
      "Di tus números, tu nombre, tu mensaje, y Capturia los pone en tu cámara al instante. Funciona en Zoom, Teams y Meet.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
