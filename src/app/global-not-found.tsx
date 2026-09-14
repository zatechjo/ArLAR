import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { display } from "@/app/fonts";
import styles from "./global-not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found | ArLAR",
  description: "The requested page could not be found on the ArLAR website.",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" className={display.variable}>
      <body className={styles.page}>
        <div className={styles.shell}>
          <Link className={styles.brand} href="/" aria-label="ArLAR home">
            <Image
              className={styles.logo}
              src="/arlar-logo-tight.png"
              alt="ArLAR — Arab League of Associations for Rheumatology"
              width={1743}
              height={825}
              priority
              unoptimized
            />
          </Link>

          <main className={styles.content}>
            <div className={styles.codeWrap} aria-hidden="true">
              <div className={styles.orbit} />
              <p className={styles.code}>404</p>
            </div>

            <section className={styles.copy}>
              <p className={styles.eyebrow}>Page not found</p>
              <h1 className={styles.title}>This page has moved out of view.</h1>
              <p className={styles.description}>
                The address may be outdated or the page may have been moved. Return to the
                ArLAR homepage, or continue with the latest news and updates.
              </p>
              <div className={styles.actions}>
                <Link className={styles.primary} href="/">
                  Return home&nbsp; →
                </Link>
                <Link className={styles.secondary} href="/news">
                  Browse latest news
                </Link>
              </div>
            </section>
          </main>

          <footer className={styles.footer}>
            <span>ArLAR · Advancing rheumatology across the Arab world</span>
            <Link href="/contact">Contact the Secretariat</Link>
          </footer>
        </div>
      </body>
    </html>
  );
}
