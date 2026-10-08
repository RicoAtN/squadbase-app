import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Squadbase · Het digitale clubhuis voor je team",
    template: "%s · Squadbase",
  },
  description: "Stand, boetes en spelersstatistieken op één plek voor amateurvoetbalteams.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=3", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico?v=3", sizes: "any" },
    ],
    shortcut: "/favicon-32x32.png?v=3",
    apple: [
      { url: "/apple-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#122c4f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=3" />
        <link rel="shortcut icon" href="/favicon-32x32.png?v=3" />
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png?v=3" />
      </head>
      <body className="min-h-screen bg-navy-950 text-slate-100 antialiased selection:bg-gold-500 selection:text-navy-950">
        {children}
      </body>
    </html>
  );
}
