const COLUMNS = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'Changelog', 'Integrations', 'API'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press', 'Brand'],
  },
  {
    title: 'Resources',
    links: ['Docs', 'Help center', 'Community', 'Security', 'Trust'],
  },
  {
    title: 'Legal',
    links: ['Terms', 'Privacy', 'DPA', 'Cookies', 'Status'],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/[0.06] pt-16 sm:pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Top section: logo + columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 sm:gap-10 mb-14 sm:mb-20">
          {/* Logo + tagline */}
          <div className="col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2 group">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-all duration-500 group-hover:scale-110"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="url(#vibe-footer-circle-grad)"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  className="opacity-60 transition-transform duration-700 origin-center group-hover:rotate-180"
                />
                <path
                  d="M7 8L12 16L17 8"
                  stroke="url(#vibe-footer-vibe-grad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 11H14"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                <defs>
                  <linearGradient id="vibe-footer-vibe-grad" x1="7" y1="8" x2="17" y2="16" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#c084fc" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="vibe-footer-circle-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="0.5" stopColor="#a78bfa" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-semibold tracking-tight">VibeOS</span>
            </div>
            <p className="text-[13.5px] text-white/45 leading-relaxed max-w-xs">
              AI meeting notes for engineering teams. From conversation to commit
              — in one click.
            </p>

            {/* Status pill */}
            <a
              href="#"
              className="inline-flex items-center gap-2 mt-4 w-fit rounded-full border-hairline bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] text-white/55 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              All systems operational
            </a>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-white/40 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[13.5px] text-white/65 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
          <p className="font-mono text-[11px] text-white/35">
            © 2026 VibeOS Labs, Inc. · Fictional product, real portfolio piece.
          </p>
          <p className="font-mono text-[11px] text-white/35">
            Designed & built by{' '}
            <span className="text-white/70 font-semibold">
              SHAIK SAAHIL ZAMEER
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
