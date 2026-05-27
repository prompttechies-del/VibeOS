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
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="vibeGradFooter" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#C4B5FD" />
                    <stop offset="1" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <path
                  d="M4.5 5.5L10.5 18.5C11 19.5 13 19.5 13.5 18.5L19.5 5.5"
                  stroke="url(#vibeGradFooter)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 8.5L12 16L15.5 8.5"
                  stroke="#FFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.85"
                />
              </svg>
              <span className="font-semibold tracking-tight">vibeOS</span>
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
            <a
              href="#"
              className="text-white/70 hover:text-white underline-offset-4 hover:underline"
            >
              shaik saahil zameer
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
