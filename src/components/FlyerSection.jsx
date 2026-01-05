import React from 'react';
import { motion } from 'framer-motion';
import { Download, ArrowRight } from 'lucide-react';
import FlyerImage from '@/assets/FLYER 2026 2027.jpg';
import BrosurPDF from '@/assets/BROSUR_SMP_MUH_35_SPMB_2026_2027.pdf';

const FlyerSection = ({ onRegisterClick }) => {
  const handleDownload = () => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = BrosurPDF;
    link.download = 'BROSUR-PPDB-SMP-Muhammadiyah-35-Jakarta-2026-2027.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-[#E8F4F8] rounded-3xl p-6 md:p-16 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#D4E8F0] skew-x-12 translate-x-20 hidden md:block opacity-50"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
            <div className="w-full md:w-1/2 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block py-1 px-3 rounded-full bg-white text-[#5D9CEC] text-[10px] md:text-xs font-bold tracking-wider mb-3 md:mb-4 border border-blue-100">INFORMASI LENGKAP</span>
                <h2 className="font-poppins text-2xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
                  Unduh Brosur Digital PPDB 2026/2027
                </h2>
                <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                  Dapatkan informasi mendetail tentang kurikulum, program unggulan, ekstrakurikuler, dan alur pendaftaran dalam satu dokumen lengkap.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start">
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 bg-white text-gray-800 px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold shadow-sm hover:shadow-md hover:text-[#5D9CEC] transition-all text-sm md:text-base"
                  >
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                    Download Flyer
                  </button>
                  <button
                    onClick={onRegisterClick}
                    className="flex items-center justify-center gap-2 bg-[#5D9CEC] text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold shadow-md hover:bg-[#4A89DC] transition-all text-sm md:text-base"
                  >
                    Bergabung Segera
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </motion.div>
            </div>
            
            <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-4 md:mt-0">
              <motion.div
                initial={{ opacity: 0, x: 30, rotate: 3 }}
                whileInView={{ opacity: 1, x: 0, rotate: 3 }}
                whileHover={{ rotate: 0, scale: 1.02 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative max-w-[280px] md:max-w-sm w-full"
              >
                <div className="absolute inset-0 bg-[#4A89DC] rounded-xl transform rotate-6 translate-x-2 translate-y-2 opacity-20"></div>
                <img 
                  className="relative w-full h-auto rounded-xl shadow-2xl border-4 border-white" 
                  alt="Flyer PPDB SMP Muhammadiyah 35 Jakarta 2026/2027"
                  loading="lazy"
                  src={FlyerImage} 
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlyerSection;