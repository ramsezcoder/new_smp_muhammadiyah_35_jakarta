import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Award, Building2 } from 'lucide-react';

const HistoryPage = () => {
  const milestones = [
    {
      year: "1985",
      title: "Pendirian Sekolah",
      description: "SMP Muhammadiyah 35 Jakarta didirikan sebagai bagian dari komitmen Muhammadiyah dalam mencerdaskan kehidupan bangsa.",
      icon: Building2
    },
    {
      year: "1995",
      title: "Perkembangan Fasilitas",
      description: "Pembangunan gedung baru dan laboratorium komputer pertama untuk meningkatkan kualitas pembelajaran.",
      icon: Award
    },
    {
      year: "2005",
      title: "Akreditasi A",
      description: "Berhasil meraih akreditasi A dari Badan Akreditasi Nasional Sekolah/Madrasah (BAN-S/M).",
      icon: Award
    },
    {
      year: "2015",
      title: "Era Digital",
      description: "Implementasi sistem pembelajaran digital dan pengembangan laboratorium multimedia modern.",
      icon: Award
    },
    {
      year: "2020",
      title: "Adaptasi Pandemi",
      description: "Transformasi ke sistem pembelajaran hybrid dengan platform online yang terintegrasi.",
      icon: Award
    },
    {
      year: "2024",
      title: "Inovasi Berkelanjutan",
      description: "Terus berinovasi dalam metode pembelajaran dan pengembangan karakter siswa berbasis nilai-nilai Islam.",
      icon: Award
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white pt-24 pb-20">
      <Helmet>
        <title>Sejarah | SMP Muhammadiyah 35 Jakarta</title>
        <meta name="description" content="Sejarah perjalanan SMP Muhammadiyah 35 Jakarta sejak berdiri hingga menjadi lembaga pendidikan yang berkualitas." />
      </Helmet>

      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => window.location.hash = ''}
          className="flex items-center gap-2 text-gray-600 hover:text-[#5D9CEC] mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Beranda</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-poppins text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Sejarah SMP Muhammadiyah 35
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Perjalanan panjang dalam mewujudkan pendidikan Islam yang berkualitas dan berkarakter
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-16"
        >
          <h2 className="font-poppins text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Tentang Kami
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              SMP Muhammadiyah 35 Jakarta merupakan salah satu lembaga pendidikan di bawah naungan Persyarikatan Muhammadiyah yang didirikan dengan tujuan untuk memberikan pendidikan berkualitas yang berlandaskan nilai-nilai Islam. Sejak berdiri, sekolah ini telah berkomitmen untuk mencetak generasi muda yang tidak hanya cerdas secara intelektual, tetapi juga memiliki karakter Islami yang kuat.
            </p>
            <p>
              Berawal dari gedung sederhana dengan jumlah siswa terbatas, SMP Muhammadiyah 35 Jakarta terus berkembang seiring dengan kepercayaan masyarakat terhadap kualitas pendidikan yang diberikan. Dengan dedikasi para pendiri, guru, dan seluruh stakeholder, sekolah ini telah menjadi salah satu pilihan utama bagi orang tua yang menginginkan pendidikan terbaik untuk putra-putri mereka.
            </p>
            <p>
              Lokasi strategis di kawasan Jakarta Selatan memudahkan akses siswa dari berbagai wilayah. Didukung oleh tenaga pendidik profesional dan fasilitas pembelajaran yang terus ditingkatkan, SMP Muhammadiyah 35 Jakarta konsisten memberikan yang terbaik dalam membentuk generasi Islami yang unggul.
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-[#5D9CEC] to-[#4A89DC] h-full"></div>

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
                    <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                      <div className="w-12 h-12 bg-[#E8F4F8] rounded-xl flex items-center justify-center">
                        <milestone.icon size={24} className="text-[#5D9CEC]" />
                      </div>
                      <span className="font-poppins text-3xl font-bold text-[#5D9CEC]">
                        {milestone.year}
                      </span>
                    </div>
                    <h3 className="font-poppins text-xl md:text-2xl font-bold text-gray-800 mb-3">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="hidden md:flex flex-shrink-0 w-6 h-6 bg-[#5D9CEC] rounded-full border-4 border-white shadow-lg z-10"></div>

                {/* Spacer */}
                <div className="hidden md:block flex-1"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Closing Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-16 bg-gradient-to-br from-[#5D9CEC] to-[#4A89DC] rounded-3xl p-8 md:p-12 shadow-2xl text-white text-center"
        >
          <Calendar size={48} className="mx-auto mb-6 opacity-80" />
          <h3 className="font-poppins text-2xl md:text-3xl font-bold mb-4">
            Melangkah Bersama Menuju Masa Depan
          </h3>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto">
            Dengan pengalaman puluhan tahun, kami terus berkomitmen untuk memberikan pendidikan terbaik yang mengintegrasikan nilai-nilai Islam, akademik berkualitas, dan pengembangan karakter siswa yang holistik.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HistoryPage;
