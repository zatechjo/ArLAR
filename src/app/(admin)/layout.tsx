import { display } from "@/app/fonts";
import "@/app/globals.css";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
