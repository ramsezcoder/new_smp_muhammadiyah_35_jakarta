import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';

const HeroSection = ({ onRegisterClick }) => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden pt-16 md:pt-20 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(93,156,236,0.65), rgba(74,137,220,0.85), rgba(232,244,248,0.95)), url(/MG_6069.webp)',
        backgroundAttachment: 'scroll'
      }}
    >
      {/* Animated Parallax Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute top-10 left-0 w-64 h-32 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute top-32 right-0 w-80 h-40 bg-white/8 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: ['-50%', '150%'] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-0 w-96 h-48 bg-blue-100/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: ['150%', '-50%'] }}
          transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-20 right-0 w-72 h-36 bg-white/7 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-4 md:mb-6"
          >
            <img 
              src="/LOGO_SMP_UPSCALE.webp" 
              alt="Logo SMP Muhammadiyah 35 Jakarta" 
              className="h-20 md:h-24 w-auto drop-shadow-2xl"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-poppins text-3xl md:text-6xl lg:text-7xl font-bold text-white mb-2 leading-tight tracking-tight drop-shadow-lg"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
          >
            Islamic & Global School
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-poppins text-xl md:text-3xl font-bold text-white mb-8 md:mb-10"
          >
            SPMB TA 2026/2027
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center w-full sm:w-auto"
          >
            <button
              onClick={onRegisterClick}
              className="group bg-[#5D9CEC] text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold text-base md:text-lg hover:bg-[#4A89DC] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Bergabung Segera
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('welcome')}
              className="bg-white border-2 border-[#5D9CEC] text-[#5D9CEC] px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold text-base md:text-lg hover:bg-blue-50 transition-all duration-300 w-full sm:w-auto hover:shadow-md"
            >
              Lihat Informasi PPDB
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute -bottom-16 md:-bottom-24 left-1/2 transform -translate-x-1/2 hidden md:block"
        >
          <button
            onClick={() => scrollToSection('welcome')}
            className="text-[#5D9CEC] animate-bounce hover:text-[#4A89DC] transition-colors"
          >
            <ChevronDown size={40} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;