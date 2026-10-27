import type { Metadata, Viewport } from "next";
import { DM_Sans, IBM_Plex_Sans_Thai, Manrope } from "next/font/google";
import "./globals.css";
import { PortalProvider } from "@/lib/store";
import { I18nProvider } from "@/lib/i18n";
import { ConfirmProvider } from "@/components/ConfirmDialog";

export const metadata: Metadata = {
  title: "Supplier Portal | Northstar",
  description: "Supplier onboarding, sample requests, company profile and documents.",
};

export const viewport: Viewport = { themeColor: "#f6f8fb" };

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
// Loopless Thai face; Thai glyphs fall through to it because the Latin fonts have no Thai subset.
const plexThai = IBM_Plex_Sans_Thai({ subsets: ["thai"], weight: ["400", "500", "600", "700"], variable: "--font-thai", display: "swap" });

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${manrope.variable} ${plexThai.variable}`}>
      <body>
        <I18nProvider>
          <ConfirmProvider>
            <PortalProvider>{children}</PortalProvider>
          </ConfirmProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
