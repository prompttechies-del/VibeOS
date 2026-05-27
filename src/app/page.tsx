'use client';

import Nav from '../sections/Nav';
import Hero from '../sections/Hero';
import LogoStrip from '../sections/LogoStrip';
import Features from '../sections/Features';
import HowItWorks from '../sections/HowItWorks';
import Pricing from '../sections/Pricing';
import Testimonials from '../sections/Testimonials';
import FinalCTA from '../sections/FinalCTA';
import Footer from '../sections/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative">
        <Hero />
        <LogoStrip />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
