/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Connected to Supabase Project: bhkdfjheduelhkgvgoqu

const FlowyChar = ({ char }: { char: string }) => (
  <span className="font-vibes text-amber-300/90 text-[1.4em] leading-none inline-block align-baseline hover:scale-110 transition-transform duration-300 transform -translate-y-1">{char}</span>
);

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Generator State
  const [generateState, setGenerateState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imgUrl = URL.createObjectURL(file);
      
      setUploadedImage(imgUrl);
      setGenerateState('processing');
      
      if (supabase) {
        try {
          // Resize and compress image using HTML Canvas
          const base64 = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            
            img.onload = () => {
              URL.revokeObjectURL(objectUrl);
              const canvas = document.createElement('canvas');
              let { width, height } = img;
              const maxDim = 512;
              
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              
              if (!ctx) {
                  return reject(new Error("Canvas context failed"));
              }
              
              // Fill background with white in case of transparent pngs
              ctx.fillStyle = "#FFFFFF";
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              
              // Export as JPEG with 0.7 compression quality
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              resolve(dataUrl);
            };
            
            img.onerror = (error) => {
              URL.revokeObjectURL(objectUrl);
              reject(error);
            };
            
            img.src = objectUrl;
          });

          if (!base64 || typeof base64 !== 'string') {
            throw new Error("Failed to process and compress image");
          }

          const { data, error } = await supabase.functions.invoke('meme-generator', {
            body: { imageBase64: base64 }
          });
          
          if (error) {
            console.error("Supabase Function Error:", error);
            throw error;
          }
          
          if (data && data.url) {
            setUploadedImage(data.url);
            setGenerateState('done');
          } else {
            throw new Error(data?.error || "Image generation returned no results");
          }
        } catch (err: any) {
          console.error("Masterpiece Generation Failed:", err);
          alert(`The Master encountered an error: ${err.message || err.toString()}`);
          setGenerateState('idle'); // Send back to idle so they can try again
        }
      } else {
        // Mock generation delay if no Supabase backend configured
        setTimeout(() => {
          setGenerateState('done');
        }, 3000);
      }
    }
  };

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
        className="absolute top-0 w-full z-50 bg-transparent py-6"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo / Left */}
          <div className="flex flex-col items-start cursor-pointer group" onClick={() => scrollTo('hero')}>
            <div className="group-hover:opacity-80 transition-opacity">
              <img src={`${import.meta.env.BASE_URL}LogoPNG.png`} alt="Meme" className="w-[67px] object-contain" />
            </div>
            <a href="https://www.lozen.dev" target="_blank" rel="noopener noreferrer" className="text-[0.5rem] tracking-[0.2em] opacity-40 uppercase group-hover:opacity-100 transition-opacity mt-1 hover:text-amber-300" onClick={(e) => e.stopPropagation()}>
              LOZENPRJKT#5
            </a>
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
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
          src={`${import.meta.env.BASE_URL}herowebm.webm`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black z-0 pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-wider mb-8 drop-shadow-2xl">
            <FlowyChar char="T" />he <FlowyChar char="A" />ge of <br/><FlowyChar char="M" />emessance
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-6 mt-12 w-full justify-center">
            <button 
              onClick={() => window.open('https://www.pump.fun', '_blank')}
              className="relative px-8 py-4 bg-amber-600/20 border border-amber-500/50 text-amber-100 uppercase tracking-widest text-sm backdrop-blur-sm overflow-hidden group hover:border-amber-400 transition-all duration-500 w-full sm:w-auto"
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Buy $MEME</span>
              <div className="absolute inset-0 bg-amber-500 transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-in-out opacity-20"></div>
            </button>
            <button 
              onClick={() => window.open('https://www.dexscreener.com', '_blank')}
              className="relative px-8 py-4 bg-transparent border border-white/30 text-white uppercase tracking-widest text-sm backdrop-blur-sm overflow-hidden group hover:border-white transition-all duration-500 w-full sm:w-auto"
            >
              <span className="relative z-10">View Chart</span>
              <div className="absolute inset-0 bg-white transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-in-out opacity-10"></div>
            </button>
            <button 
              onClick={() => window.open('https://www.x.com/lozendev', '_blank')}
              className="relative px-8 py-4 bg-transparent border border-white/30 text-white uppercase tracking-widest text-sm backdrop-blur-sm overflow-hidden group hover:border-white transition-all duration-500 w-full sm:w-auto"
            >
              <span className="relative z-10">Follow X</span>
              <div className="absolute inset-0 bg-white transform scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-500 ease-in-out opacity-10"></div>
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative h-screen w-full flex flex-col justify-center border-t border-amber-500"
      >
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50 z-0"
          src={`${import.meta.env.BASE_URL}aboutwebm.webm`}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/20 to-black/80 z-0 pointer-events-none" />

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
                By blending timeless art with the raw, chaotic energy of internet memes, we're entering a new golden era of virality, community, and unapologetic fun. <span className="text-amber-300 font-normal">{"MEMESSANCE"}</span> is more than a token. It's the currency of the new cultural awakening.
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
        className="relative h-screen w-full flex flex-col items-center justify-center border-t border-amber-500"
      >
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
          src={`${import.meta.env.BASE_URL}roadwebm.webm`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-0 pointer-events-none" />

        <div className="relative z-10 text-center w-full max-w-4xl px-4 flex flex-col items-center h-full justify-start pt-32">
          <h2 className="text-5xl md:text-6xl lg:text-7xl tracking-wider mb-4 drop-shadow-lg">
            <FlowyChar char="T" />he <FlowyChar char="M" />asterpieces
          </h2>
          <p className="text-slate-400 font-sans tracking-widest uppercase text-sm mb-12 opacity-80 backdrop-blur-sm bg-black/20 px-4 py-1 rounded inline-block">Let the master work</p>
          
          {/* Generator Component */}
          <div className="w-full max-w-lg aspect-square border-2 border-dashed border-white/20 bg-black/40 backdrop-blur-md rounded-xl flex items-center justify-center flex-col gap-4 group overflow-hidden relative">
             {generateState === 'idle' && (
               <>
                 <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 cursor-pointer p-4">
                    <img src={`${import.meta.env.BASE_URL}LogoPNG.png`} alt="Meme" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                 </div>
                 <label htmlFor="file-upload" className="text-white/70 font-sans text-sm tracking-widest text-center px-8 cursor-pointer group-hover:text-white transition-colors">
                    Upload image and Leonardo do his thing. <br/><br/><span className="text-amber-500/80 underline">Click to Browse</span>
                 </label>
                 <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
               </>
             )}
             
             {generateState === 'processing' && uploadedImage && (
               <div className="flex flex-col items-center justify-center h-full w-full p-8 animate-pulse">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500/50 mb-6 relative">
                    <img src={uploadedImage} alt="Original" className="w-full h-full object-cover filter grayscale blur-[2px]" />
                    <div className="absolute inset-0 border-t-4 border-amber-300 rounded-full animate-spin" style={{borderTopColor: 'transparent', borderBottomColor: '#fcd34d', animationDuration: '1s'}}></div>
                  </div>
                  <p className="text-amber-300 font-vibes text-3xl mb-2">Summoning Da Vinci...</p>
                  <p className="text-white/50 text-xs tracking-widest uppercase">Applying Renaissance Filter</p>
               </div>
             )}
             
             {generateState === 'done' && (
               <div className="flex flex-col items-center justify-center h-full w-full relative group/result">
                  <img src={uploadedImage || ''} alt="Renaissance result" className="absolute inset-0 w-full h-full object-cover sepia-[.8] contrast-125 brightness-90 filter" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/result:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-6 left-0 w-full flex justify-center gap-4 opacity-0 group-hover/result:opacity-100 transition-opacity duration-300 translate-y-4 group-hover/result:translate-y-0">
                    <button 
                      onClick={() => setGenerateState('idle')}
                      className="px-6 py-2 bg-black/80 backdrop-blur-md border border-white/40 text-white uppercase text-xs tracking-widest hover:bg-white/20 transition-colors"
                    >
                      Try Again
                    </button>
                    <button className="px-6 py-2 bg-amber-600/90 backdrop-blur-md border border-amber-500 text-white uppercase text-xs tracking-widest hover:bg-amber-500 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                      Share to X
                    </button>
                  </div>
               </div>
             )}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section
        id="roadmap"
        className="relative h-[100vh] w-full flex flex-col justify-between pt-24 pb-8 border-t border-amber-500"
      >
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 z-0 mix-blend-luminosity"
          src={`${import.meta.env.BASE_URL}featureswebm.webm`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0 pointer-events-none" />

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
          <a href="https://www.lozen.dev" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest text-white/30 uppercase font-sans hover:text-amber-300 transition-colors">
            2026 &copy; LOZENPRJKT#5
          </a>
        </footer>
      </section>
    </div>
  );
}

