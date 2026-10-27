import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PortalProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Supplier Portal | Northstar",
  description: "Supplier onboarding, sample requests, company profile and documents.",
};

export const viewport: Viewport = { themeColor: "#f6f8fb" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <PortalProvider>{children}</PortalProvider>
      </body>
    </html>
  );
}
