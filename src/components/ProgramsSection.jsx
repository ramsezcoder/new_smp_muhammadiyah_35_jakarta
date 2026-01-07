import React from 'react';
import { motion } from 'framer-motion';
import TahfidzIcon from '@/assets/TAHFIDZ_DAN_TAHSIN.png';
import StreamIcon from '@/assets/STREAM.png';
import LMSIcon from '@/assets/BERBASIS_LMS.png';
import ExchangeIcon from '@/assets/STUDENT_EXCHANGE.png';
import ExtracurricularIcon from '@/assets/EXTRACURRICULAR.png';
import InternationalIcon from '@/assets/INTERNATIONAL_ENGLISH_SYLLABUS.png';
import CodingRoboticIcon from '@/assets/CODING_ROBOTIC.png';
import MagangCitaCitaIcon from '@/assets/MAGANG_CITA_CITA.png';
import ProgramKeputrianIcon from '@/assets/PROGRAM_KEPUTRIAN.png';
import SubuhWarriorIcon from '@/assets/SUBUH_WARRIOR.png';

const ProgramsSection = () => {
  const programs = [
    {
      icon: TahfidzIcon,
      title: 'Tahfidz & Tahsin Bersanad',
      description: 'Program unggulan menghafal Al-Quran dengan metode sanad yang terjaga kualitas bacaannya.'
    },
    {
      icon: StreamIcon,
      title: 'STREAM',
      subtitle: 'Science, Technology, Religious, Engineering, Art, dan Mathematics',
      description: 'Kurikulum ISMUBA tetap diterapkan sebagai penguatan karakter Islami, berpadu dengan pendekatan STREAM untuk membentuk siswa yang kompeten, berakhlak, dan visioner.'
    },
    {
      icon: LMSIcon,
      title: 'Berbasis LMS',
      description: 'Sistem pembelajaran digital terintegrasi (Learning Management System) untuk efektivitas belajar.'
    },
    {
      icon: ExchangeIcon,
      title: 'Student Exchange',
      description: 'Kesempatan belajar dan pertukaran budaya ke luar negeri untuk wawasan global siswa.'
    },
    {
      icon: ExtracurricularIcon,
      title: 'Ekstrakurikuler',
      description: 'Pengembangan bakat dan minat melalui beragam kegiatan non-akademik yang berprestasi.'
    },
    {
      icon: InternationalIcon,
      title: 'International English Syllabus',
      description: 'Program pembelajaran berbahasa Inggris dengan penguatan kompetensi global serta kesiapan menghadapi kurikulum internasional.'
    },
    {
      icon: CodingRoboticIcon,
      title: 'Coding & Robotic',
      description: 'Program penguatan literasi digital melalui kegiatan coding dan robotic untuk melatih logika, kreativitas, dan problem solving siswa di era teknologi.'
    },
    {
      icon: MagangCitaCitaIcon,
      title: 'Magang Cita-Cita',
      description: 'Program pengalaman belajar di dunia kerja sesuai minat karier siswa untuk menumbuhkan kesiapan mental, karakter, dan wawasan profesi sejak dini.'
    },
    {
      icon: ProgramKeputrianIcon,
      title: 'Program Keputrian',
      description: 'Program pembinaan khusus siswi yang terintegrasi dengan layanan Bimbingan Konseling (BK) untuk penguatan adab, akhlak, kepemimpinan, dan karakter muslimah.'
    },
    {
      icon: SubuhWarriorIcon,
      title: 'Subuh Warrior',
      description: 'Gerakan pembiasaan shalat Subuh berjamaah sebagai upaya pembentukan karakter disiplin, tanggung jawab, dan kedekatan spiritual siswa kepada Allah SWT.'
    }
  ];

  return (
    <section id="programs" className="py-12 md:py-24 bg-[#FAFDFF]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <span className="text-[#5D9CEC] font-bold tracking-wider text-xs md:text-sm uppercase">Keunggulan Kami</span>
          <h2 className="font-poppins text-2xl md:text-4xl font-bold text-gray-800 mt-2 mb-4 md:mb-6">
            PROGRAM DI SMP MUHAMMADIYAH 35 JAKARTA
          </h2>
          <div className="w-16 md:w-20 h-1.5 bg-[#5D9CEC] rounded-full mx-auto opacity-50"></div>
        </motion.div>

        {/* Desktop Grid / Mobile Carousel */}
        <div className="flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6 md:pb-0 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-hide">
          {programs.map((program, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="min-w-[240px] md:min-w-0 snap-center bg-white rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-50 group flex flex-col"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mb-3 md:mb-4 transition-colors duration-300">
                  <img src={program.icon} alt={program.title} className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                </div>
                <h3 className="font-poppins text-base md:text-lg font-bold text-gray-800 mb-2 group-hover:text-[#5D9CEC] transition-colors">
                  {program.title}
                </h3>
                {program.subtitle && (
                  <p className="text-xs text-[#5D9CEC] font-medium mb-2 uppercase tracking-wide">
                    {program.subtitle}
                  </p>
                )}
                <p className="text-gray-600 leading-relaxed text-xs md:text-sm">
                  {program.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;