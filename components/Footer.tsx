import Link from "next/link";

const pages = [
  { href: "/", label: "Home" },
  { href: "/finance", label: "Pitches" },
  { href: "/marketing", label: "Marketing" },
  { href: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="bg-[#020B1A] text-white py-12 px-8">
      {/* Prominent email */}
      <div className="mb-10">
        <a
          href="mailto:nbalkar2@uwo.ca"
          className="text-4xl md:text-6xl font-serif font-semibold tracking-tight hover:text-gray-300 transition-colors block"
        >
          nbalkar2@uwo.ca
        </a>
      </div>

      {/* Top Section: 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 text-sm">
        {/* Col 1: Brand */}
        <div>
          <span className="font-semibold">Nathaniel Balkaran</span>
        </div>

        {/* Col 2: Pages */}
        <nav aria-label="Footer pages">
          <ul className="space-y-2">
            {pages.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Col 3: Connect */}
        <div>
          <ul className="space-y-2">
            <li>
              <a
                href="https://www.linkedin.com/in/nathanielbalkaran"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="mailto:nbalkar2@uwo.ca"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Email
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: Colophon */}
        <p className="text-gray-500">
          Built with Next.js and Tailwind. Deployed on Vercel. Help from Cursor
          and Gemini.
        </p>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10 mt-10 pt-6 flex justify-between text-xs text-gray-600">
        <span>© 2026 Nathaniel Balkaran</span>
        <div className="flex items-center gap-3">
          <a
            href="https://youtube.com/shorts/QuKVuuIfcE0?si=86gJe6n7YC_i67kS"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Easter egg"
            className="text-gray-700 hover:text-gray-400 transition-colors"
          >
            🍳
          </a>
          <span>v1.0</span>
        </div>
      </div>
    </footer>
  );
}
