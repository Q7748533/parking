import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="AirportMatrix Home">
            <div className="w-6 h-6 bg-[#6366f1] rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">AM</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              AIRPORT <span className="text-[#6366f1]">MATRIX</span>
            </span>
          </Link>

          {/* Footer Links */}
          <nav className="flex items-center gap-6 text-xs text-gray-500" aria-label="Footer navigation">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-gray-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-gray-500" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} AirportMatrix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
