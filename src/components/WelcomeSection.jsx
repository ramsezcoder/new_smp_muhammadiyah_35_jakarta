import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';

const WelcomeSection = ({ onRegisterClick }) => {
  return (
    <section id="welcome" className="py-12 md:py-24 bg-white relative">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#E8F4F8]/50 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-poppins text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2 md:mb-4 leading-tight">
              SELAMAT DATANG DI PPDB <br/>
              <span className="text-[#5D9CEC]">SMP MUHAMMADIYAH 35 JAKARTA</span>
            </h2>
            <div className="text-sm md:text-xl font-medium text-gray-500 tracking-widest uppercase">
              Tahun Pelajaran 2026/2027
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-[#E8F4F8] rounded-3xl p-6 md:p-8 shadow-sm border border-blue-50">
                <h3 className="font-poppins text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                  <span className="w-1.5 md:w-2 h-6 md:h-8 bg-[#5D9CEC] rounded-full"></span>
                  Jadwal Pendaftaran
                </h3>
                
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 p-2 md:p-3 rounded-xl text-[#5D9CEC]">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <div className="text-xs md:text-sm text-gray-500 font-medium">Waktu Mulai</div>
                      <div className="font-bold text-gray-800 text-base md:text-lg">1 November 2025</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 p-2 md:p-3 rounded-xl text-[#5D9CEC]">
                      <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <div className="text-xs md:text-sm text-gray-500 font-medium">Hari Layanan</div>
                      <div className="font-bold text-gray-800 text-base md:text-lg">Senin – Sabtu</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 p-2 md:p-3 rounded-xl text-[#5D9CEC]">
                      <Clock className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <div className="text-xs md:text-sm text-gray-500 font-medium">Jam Operasional</div>
                      <div className="font-bold text-gray-800 text-base md:text-lg">08.00 – 14.00 WIB</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-8">
                  <button
                    onClick={onRegisterClick}
                    className="w-full bg-[#5D9CEC] text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-[#4A89DC] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    Daftar Sekarang
                  </button>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4E8F0] rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-100 rounded-full blur-3xl opacity-50"></div>
                
                <p className="font-poppins text-xl md:text-3xl font-light text-gray-600 leading-relaxed mb-4 md:mb-6 italic">
                  "Membangun Generasi Cerdas, Berkarakter Islami, dan Berwawasan Global"
                </p>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 font-light">
                  Assalamu'alaikum Warahmatullahi Wabarakatuh,
                  <br /><br />
                  Dengan rasa syukur dan bangga, kami mengundang putra-putri terbaik bangsa untuk bergabung menjadi bagian dari keluarga besar SMP Muhammadiyah 35 Jakarta. Kami berdedikasi menghadirkan pendidikan holistik yang menyeimbangkan kecerdasan intelektual, spiritual, dan emosional dalam lingkungan belajar yang modern, aman, dan menyenangkan.
                </p>
                <div className="w-16 md:w-20 h-1 bg-[#5D9CEC] rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WelcomeSection;