import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Microscope, Monitor, Library, Utensils, Activity, Wifi, Building, Music } from 'lucide-react';

const FacilitiesSection = () => {
  const facilities = [
    { icon: Building, name: 'Ruang Kelas Modern' },
    { icon: Microscope, name: 'Lab IPA' },
    { icon: Monitor, name: 'Lab Komputer' },
    { icon: Library, name: 'Perpustakaan' },
    { icon: Utensils, name: 'Kantin Sehat' },
    { icon: Activity, name: 'Lapangan Olahraga' },
    { icon: Wifi, name: 'Free WiFi Area' },
    { icon: Music, name: 'Ruang Seni & Musik' },
  ];

  return (
    <section id="facilities" className="py-12 md:py-24 bg-[#FAFDFF]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          <div className="w-full md:w-1/3 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-poppins text-2xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
                Fasilitas Penunjang Pembelajaran
              </h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                Kami menyediakan sarana dan prasarana lengkap yang modern, bersih, dan nyaman untuk mendukung proses belajar mengajar serta pengembangan bakat siswa secara optimal.
              </p>
              <div className="h-48 md:h-64 rounded-2xl overflow-hidden shadow-lg border-4 border-white hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1562774053-701939374585"
                  alt="Fasilitas Sekolah - SMP Muhammadiyah 35 Jakarta"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>

          <div className="w-full md:w-2/3">
            {/* Desktop Grid / Mobile Carousel */}
            <div className="flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:pb-0 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-hide">
              {facilities.map((facility, index) => {
                const Icon = facility.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="min-w-[140px] snap-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-blue-50 text-center hover:shadow-md hover:border-[#5D9CEC]/30 transition-all duration-300 flex flex-col items-center justify-center"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#E8F4F8] rounded-xl flex items-center justify-center mb-3 md:mb-4 text-[#5D9CEC]">
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="font-poppins font-medium text-gray-800 text-xs md:text-sm">
                      {facility.name}
                    </h3>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;