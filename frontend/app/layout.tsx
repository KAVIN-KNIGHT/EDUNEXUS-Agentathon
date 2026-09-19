import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduNexus — Your Adaptive Learning Companion",
  description: "Learn, revise, and test your knowledge with an intelligent study companion that adapts to you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>

        {/* ── Navigation Bar ── */}
        <header style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", height: 60 }}
               className="flex items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 no-underline"
                  style={{ textDecoration: "none" }}>
              <div style={{
                width: 34, height: 34,
                background: "var(--accent)",
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, color: "#fff", fontSize: 15,
              }}>E</div>
              <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                EduNexus
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="flex items-center gap-1">
              {[
                { href: "/",       label: "Home"   },
                { href: "/learn",  label: "Learn"  },
                { href: "/revise", label: "Revise" },
                { href: "/test",   label: "Test"   },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  className="nav-link hover:text-[var(--text-primary)] hover:bg-[var(--bg)]"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Status dot */}
            <div className="hidden sm:flex items-center gap-2"
                 style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <span style={{
                display: "inline-block", width: 7, height: 7,
                borderRadius: "50%", background: "#16A34A",
              }} />
              Ready
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1" style={{ maxWidth: 1120, margin: "0 auto", width: "100%", padding: "32px 24px" }}>
          {children}
        </main>

        {/* ── Footer ── */}
        <footer style={{
          borderTop: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "20px 24px",
          textAlign: "center",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
        }}>
          EduNexus &nbsp;·&nbsp; Adaptive Mastery Companion &nbsp;·&nbsp; Powered by LangGraph & ChromaDB
        </footer>
      </body>
    </html>
  );
}
