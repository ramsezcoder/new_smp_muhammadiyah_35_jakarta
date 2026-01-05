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
    <section id="hero" className="relative min-h-[70vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover scale-105" 
          alt="Suasana lingkungan kampus SMP Muhammadiyah 35 Jakarta - Islamic & Global School" 
          loading="eager"
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8F4F8]/90 via-[#D4E8F0]/85 to-white/95"></div>
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
            <span className="bg-white/50 backdrop-blur-sm border border-blue-100 text-[#4A89DC] px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold tracking-wide shadow-sm">
              SMP_Muhammadiyah_35_Jakarta
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-poppins text-3xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-2 leading-tight tracking-tight"
          >
            Islamic & Global School
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-poppins text-xl md:text-3xl font-light text-[#5D9CEC] mb-8 md:mb-10"
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