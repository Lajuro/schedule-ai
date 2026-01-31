import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "./providers/SessionProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ToastProvider } from "./components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Escala-IA | Sincronize seus plantões com Google Calendar",
  description: "Faça upload da imagem do seu calendário e sincronize automaticamente seus dias de trabalho com o Google Calendar usando IA",
  keywords: ["escala", "plantão", "google calendar", "IA", "sincronização", "agenda"],
  authors: [{ name: "Escala-IA" }],
  creator: "Escala-IA",
  openGraph: {
    title: "Escala-IA - Sincronização Inteligente de Plantões",
    description: "Sincronize sua escala de trabalho com o Google Calendar usando Inteligência Artificial",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Escala-IA - Sincronização Inteligente de Plantões",
    description: "Sincronize sua escala de trabalho com o Google Calendar usando IA",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('escala-ia-theme');
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const isDark = theme === 'dark' || (theme === 'system' && systemDark) || (!theme && systemDark);
                  document.documentElement.classList.toggle('dark', isDark);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider defaultTheme="system">
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
