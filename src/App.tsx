/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const FlowyChar = ({ char }: { char: string }) => (
  <span className="font-vibes text-amber-300/90 text-[1.4em] leading-none inline-block align-baseline hover:scale-110 transition-transform duration-300 transform -translate-y-1">{char}</span>
);

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled ? 'bg-black/80 backdrop-blur-md py-4 shadow-lg shadow-black/50' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo / Left */}
          <div className="flex flex-col items-start cursor-pointer group" onClick={() => scrollTo('hero')}>
            <div className="text-2xl tracking-widest font-bold group-hover:text-amber-300 transition-colors">
              <span className="font-vibes text-4xl text-amber-300">M</span>EME
            </div>
            <div className="text-[0.5rem] tracking-[0.2em] opacity-40 uppercase group-hover:opacity-100 transition-opacity mt-1">
              LOZENPRJKT#5
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-12">
            {['About', 'Meme Me', 'Roadmap'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                className="text-sm tracking-widest uppercase hover:text-amber-300 transition-colors relative group overflow-hidden"
              >
                <span className="relative z-10">{item}</span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-amber-300 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-slate-200 hover:text-amber-300 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-lg border-t border-white/10 transition-all duration-300 origin-top overflow-hidden ${
            mobileMenuOpen ? 'max-h-[300px] border-b opacity-100' : 'max-h-0 opacity-0 border-transparent'
          }`}
        >
          <div className="flex flex-col px-6 py-4 space-y-6">
            {['About', 'Meme Me', 'Roadmap'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                className="text-left text-lg tracking-widest uppercase hover:text-amber-300 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative h-screen w-full flex flex-col items-center justify-center pt-20"
      >
        {/* Replace with your first image using style={{ backgroundImage: 'url(...)'}} or an img tag */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 z-0"
          style={{ backgroundImage: `url('/heroHighres.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-0 pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-wider mb-8 drop-shadow-2xl">
            <FlowyChar char="T" />he <FlowyChar char="A" />ge of <FlowyChar char="M" />emessance
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-6 mt-12 w-full justify-center">
            <button className="relative px-8 py-4 bg-amber-600/20 border border-amber-500/50 text-amber-100 uppercase tracking-widest text-sm backdrop-blur-sm overflow-hidden group hover:border-amber-400 transition-all duration-500 w-full sm:w-auto">
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Buy $MEME</span>
              <div className="absolute inset-0 bg-amber-500 transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-in-out opacity-20"></div>
            </button>
            <button className="relative px-8 py-4 bg-transparent border border-white/30 text-white uppercase tracking-widest text-sm backdrop-blur-sm overflow-hidden group hover:border-white transition-all duration-500 w-full sm:w-auto">
              <span className="relative z-10">View Chart</span>
              <div className="absolute inset-0 bg-white transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-in-out opacity-10"></div>
            </button>
            <button className="relative px-8 py-4 bg-transparent border border-white/30 text-white uppercase tracking-widest text-sm backdrop-blur-sm overflow-hidden group hover:border-white transition-all duration-500 w-full sm:w-auto">
              <span className="relative z-10">Follow X</span>
              <div className="absolute inset-0 bg-white transform scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-500 ease-in-out opacity-10"></div>
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative h-screen w-full flex flex-col justify-center"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
          style={{ backgroundImage: `url('/abouthighres.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-black/90 z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full flex justify-end">
          <div className="w-full md:w-1/2 lg:w-5/12 text-right">
            <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-wide mb-8">
              <FlowyChar char="T" />he <FlowyChar char="D" />awn of <br/><FlowyChar char="M" />emessance
            </h2>
            <div className="space-y-6 text-lg md:text-xl text-slate-300 leading-relaxed font-sans font-light">
              <p>
                In the 15th-16th century, the Renaissance pulled Europe out of the dark ages with art, culture, and revolutionary ideas. We are resurrecting the spirit of boundless creativity, where memes aren't just jokes — they're the new masterpieces that shape culture.
              </p>
              <p>
                By blending timeless art with the raw, chaotic energy of internet memes, we're entering a new golden era of virality, community, and unapologetic fun. <span className="text-amber-300 font-normal">{"$MEMESSANCE"}</span> is more than a token. It's the currency of the new cultural awakening.
              </p>
              <p className="pt-4 text-xl md:text-2xl font-primary text-white">
                The age of memessance is upon us.<br/> Will you join the movement?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meme Me Section */}
      <section
        id="meme-me"
        className="relative h-screen w-full flex flex-col items-center justify-center"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 z-0"
          style={{ backgroundImage: `url('/roadHighres.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 z-0 pointer-events-none" />

        <div className="relative z-10 text-center w-full max-w-4xl px-4 flex flex-col items-center h-full justify-start pt-32">
          <h2 className="text-5xl md:text-6xl lg:text-7xl tracking-wider mb-4 drop-shadow-lg">
            <FlowyChar char="M" />asterpieces
          </h2>
          <p className="text-slate-400 font-sans tracking-widest uppercase text-sm mb-12 opacity-80 backdrop-blur-sm bg-black/20 px-4 py-1 rounded inline-block">Meme Generator Coming Soon</p>
          
          {/* Placeholder for generator */}
          <div className="w-full max-w-lg aspect-square border-2 border-dashed border-white/20 bg-black/40 backdrop-blur-md rounded-xl flex items-center justify-center flex-col gap-4 group cursor-not-allowed">
             <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <span className="font-vibes text-4xl text-amber-300/50">M</span>
             </div>
             <p className="text-white/50 font-sans text-sm tracking-widest text-center px-8">Upload profile picture to apply a memessance effect. <br/><br/><span className="text-amber-500/80">Under Construction</span></p>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section
        id="roadmap"
        className="relative h-screen w-full flex flex-col justify-between pt-24 pb-8"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 z-0 mix-blend-luminosity"
          style={{ backgroundImage: `url('/featureshighres.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full flex-grow flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-wider mb-16 text-center">
            <FlowyChar char="T" />he <FlowyChar char="P" />ath to <FlowyChar char="E" />nlightenment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl mx-auto">
            {/* Phase 1 */}
            <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 p-8 pt-10 hover:border-amber-500/50 transition-colors duration-500 group overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <span className="font-vibes text-6xl text-amber-50">I</span>
               </div>
               <h3 className="text-2xl text-amber-300 mb-4 tracking-wider">Phase 1: Awakening</h3>
               <ul className="space-y-4 font-sans font-light text-slate-300">
                 <li className="flex items-start"><span className="text-amber-500 mr-2 mt-1">✦</span> Meme drop</li>
                 <li className="flex items-start"><span className="text-amber-500 mr-2 mt-1">✦</span> Website launch</li>
                 <li className="flex items-start"><span className="text-amber-500 mr-2 mt-1">✦</span> Community building</li>
               </ul>
            </div>

            {/* Phase 2 */}
            <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 p-8 pt-10 hover:border-amber-500/50 transition-colors duration-500 group overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <span className="font-vibes text-6xl text-amber-50">II</span>
               </div>
               <h3 className="text-2xl text-amber-300 mb-4 tracking-wider">Phase 2: Reformation</h3>
               <ul className="space-y-4 font-sans font-light text-slate-300">
                 <li className="flex items-start"><span className="text-amber-500 mr-2 mt-1">✦</span> Listings on major DEXs</li>
                 <li className="flex items-start"><span className="text-amber-500 mr-2 mt-1">✦</span> Marketing campaigns</li>
                 <li className="flex items-start"><span className="text-amber-500 mr-2 mt-1">✦</span> Artist collaborations</li>
               </ul>
            </div>

            {/* Phase 3 */}
            <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 p-8 pt-10 hover:border-amber-500/50 transition-colors duration-500 group overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <span className="font-vibes text-6xl text-amber-50">III</span>
               </div>
               <h3 className="text-2xl text-amber-300 mb-4 tracking-wider">Phase 3: Golden Age</h3>
               <ul className="space-y-4 font-sans font-light text-slate-300">
                 <li className="flex items-start"><span className="text-amber-500 mr-2 mt-1">✦</span> CEX listings?</li>
                 <li className="flex items-start"><span className="text-amber-500 mr-2 mt-1">✦</span> Meme contests with prizes</li>
                 <li className="flex items-start"><span className="text-amber-500 mr-2 mt-1">✦</span> Real-world stunts &<br/>cultural domination</li>
               </ul>
            </div>

            {/* Phase 4 */}
            <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 p-8 pt-10 hover:border-amber-500/50 transition-colors duration-500 group overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <span className="font-vibes text-6xl text-amber-50">IV</span>
               </div>
               <h3 className="text-2xl text-amber-300 mb-4 tracking-wider">Phase 4: Eternal Legacy</h3>
               <ul className="space-y-4 font-sans font-light text-slate-300">
                 <li className="flex items-start"><span className="text-amber-500 mr-2 mt-1">✦</span> ? (community voted)</li>
                 <li className="flex items-start"><span className="text-amber-500 mr-2 mt-1">✦</span> Metaverse gallery</li>
                 <li className="flex items-start"><span className="text-amber-500 mr-2 mt-1">✦</span> & more...</li>
               </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 w-full text-center mt-12 pb-4">
          <p className="text-xs tracking-widest text-white/30 uppercase font-sans">
            2026 &copy; LOZENPRJKT#5
          </p>
        </footer>
      </section>
    </div>
  );
}

