"use client";

// Used only for `npm run build:offline` (aliased over "next/navigation" in next.config.ts).
// On file:// the Next.js client router cannot fetch route payloads, so programmatic
// navigation is delegated to the shim injected by scripts/make-offline.mjs.
import { useMemo } from "react";
import { usePathname as useNextPathname, useRouter as useNextRouter } from "next/dist/client/components/navigation";

export * from "next/dist/client/components/navigation";

type OfflineWindow = Window & { __offlineNav?: (href: string, replace?: boolean) => void; __offlinePath?: string };

// On file:// location.pathname is the file path, so the shim provides the real route.
export function usePathname() {
  const pathname = useNextPathname();
  return (typeof window !== "undefined" && (window as OfflineWindow).__offlinePath) || pathname;
}

export function useRouter() {
  const router = useNextRouter();
  return useMemo(
    () => ({
      ...router,
      push: (href: string, options?: Parameters<typeof router.push>[1]) => {
        const nav = (window as OfflineWindow).__offlineNav;
        if (nav) nav(href);
        else router.push(href, options);
      },
      replace: (href: string, options?: Parameters<typeof router.replace>[1]) => {
        const nav = (window as OfflineWindow).__offlineNav;
        if (nav) nav(href, true);
        else router.replace(href, options);
      },
    }),
    [router],
  );
}
