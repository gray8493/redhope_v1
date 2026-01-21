import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import { SectionStats, SectionFeatures } from '../components/SectionFeatures';
import SectionTestimonials from '../components/SectionTestimonials';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';
const Page = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary/20 selection:text-primary-dark">
      <Navbar />
      <main>
        <Hero />
        <SectionStats />
        <SectionFeatures />
        <SectionTestimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

export default Page;

