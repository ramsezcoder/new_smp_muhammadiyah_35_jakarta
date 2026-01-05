import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Ticket } from 'lucide-react';

const PricingSection = ({ onRegisterClick }) => {
  const priceItems = [
    { label: 'Uang Pangkal', amount: 'Rp 5.450.000' },
    { label: 'Seragam (Lengkap)', amount: 'Rp 1.700.000' },
    { label: 'Program Kegiatan 1 Tahun', amount: 'Rp 3.000.000' },
    { label: 'SPP Bulan Pertama', amount: 'Rp 850.000' },
  ];

  return (
    <section id="pricing" className="py-12 md:py-24 bg-[#FAFDFF]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8 md:mb-16">
            <h2 className="font-poppins text-2xl md:text-4xl font-bold text-gray-800 mb-3 md:mb-4">
              Investasi Pendidikan
            </h2>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto">
              Transparansi biaya pendidikan untuk masa depan terbaik putra-putri Anda tanpa biaya tersembunyi.
            </p>
          </div>

          <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl overflow-hidden border border-blue-50 relative">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#E8F4F8] to-[#D4E8F0] rounded-bl-full opacity-50 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row">
              {/* Left Side: Breakdown */}
              <div className="p-6 md:p-12 w-full md:w-3/5 relative z-10">
                <h3 className="font-poppins text-xl md:text-2xl font-bold text-gray-800 mb-6 md:mb-8">Rincian Biaya Masuk</h3>
                <div className="space-y-4 md:space-y-5">
                  {priceItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-3 md:pb-4 last:border-0 last:pb-0 text-sm md:text-base">
                      <div className="flex items-center gap-2 md:gap-3">
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#5D9CEC] shrink-0" />
                        <span className="text-gray-600 font-medium">{item.label}</span>
                      </div>
                      <span className="font-bold text-gray-800 text-right">{item.amount}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 md:mt-10 pt-4 md:pt-6 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-gray-500 font-medium text-sm md:text-base">Total Normal</span>
                  <span className="text-lg md:text-2xl font-bold text-gray-400 line-through decoration-red-400">Rp 11.000.000</span>
                </div>
              </div>

              {/* Right Side: Total & Action */}
              <div className="w-full md:w-2/5 bg-[#F5FBFF] p-6 md:p-12 flex flex-col justify-center relative border-t md:border-t-0 md:border-l border-blue-50">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-[#5D9CEC] to-transparent opacity-20 md:hidden"></div>
                
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-blue-100 mb-6 md:mb-8 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#5D9CEC]"></div>
                  <div className="flex justify-center mb-2 text-[#5D9CEC]">
                    <Ticket className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div className="text-xs md:text-sm font-bold text-[#5D9CEC] mb-1 tracking-wider uppercase">Special Discount</div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">15%</div>
                  <div className="text-[10px] md:text-xs text-gray-500">Berlaku sampai 7 Juli 2026</div>
                </div>

                <div className="text-center mb-6 md:mb-8">
                  <div className="text-gray-500 mb-1 text-xs md:text-sm font-medium">Total yang harus dibayar</div>
                  <div className="text-2xl md:text-4xl font-extrabold text-[#5D9CEC]">Rp 9.350.000</div>
                </div>

                <button
                  onClick={onRegisterClick}
                  className="w-full bg-[#5D9CEC] text-white py-3 md:py-4 rounded-xl font-bold hover:bg-[#4A89DC] shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-sm md:text-base"
                >
                  Klaim Diskon & Daftar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;