import PortalShell from "@/components/PortalShell";

export default function PortalLayout({ children }: LayoutProps<"/">) {
  return <PortalShell>{children}</PortalShell>;
}
