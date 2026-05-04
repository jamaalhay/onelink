"use client";

import { usePathname } from "next/navigation";

// Hides the storefront chrome (header / footer / delivery bar / age gate /
// demo nav) on routes that need to render full-screen — currently only
// /studio for the embedded Sanity CMS.
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/studio")) return null;
  return <>{children}</>;
}
