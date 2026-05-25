"use client";

import { useEffect, useState } from 'react';
import Button from '../components/Button';

const LINKS = [
  { label: 'Product', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Changelog', href: '#' },
  { label: 'Docs', href: '#' },
];

const Logo = () => (
  <a href="#" className="flex items-center gap-2 group">
    {/* VibeOS tech logo */}
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-500 group-hover:scale-110"
    >
      {/* Outer tech circle with rotation on hover */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="url(#circle-grad)"
        strokeWidth="1.5"
        strokeDasharray="4 2"
        className="opacity-60 transition-transform duration-700 origin-center group-hover:rotate-180"
      />
      {/* Stylized inner V representing Vibe */}
      <path
        d="M7 8L12 16L17 8"
        stroke="url(#vibe-grad)"
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
        <linearGradient id="vibe-grad" x1="7" y1="8" x2="17" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="circle-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
    <span className="font-semibold text-base tracking-tight text-white">VibeOS</span>
  </a>
);

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-black/70 border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-5 sm:px-8 h-14 sm:h-16">
        <Logo />

        <ul className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-[13px] font-medium text-white/60 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#"
            className="hidden sm:inline-block text-[13px] font-medium text-white/60 hover:text-white transition-colors px-2"
          >
            Sign in
          </a>
          <Button variant="primary" size="sm">
            Try VibeOS
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Nav;
