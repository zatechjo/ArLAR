import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "ArLAR Control", template: "%s · ArLAR Control" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
