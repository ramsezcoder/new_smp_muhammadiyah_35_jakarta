import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, CheckCircle2 } from 'lucide-react';

const VisionMissionPage = () => {
  const missionItems = [
    "Menyelenggarakan pendidikan yang berkualitas dengan mengintegrasikan nilai-nilai Islam dalam setiap aspek pembelajaran",
    "Mengembangkan potensi akademik dan non-akademik siswa melalui program pembelajaran yang inovatif dan berkarakter",
    "Membentuk generasi yang berakhlakul karimah, cerdas, kreatif, dan berwawasan global",
    "Menciptakan lingkungan belajar yang kondusif, aman, dan nyaman bagi seluruh warga sekolah",
    "Membangun kemitraan yang kuat dengan orang tua dan masyarakat dalam mendukung pendidikan siswa",
    "Mengembangkan kompetensi guru dan tenaga kependidikan secara berkelanjutan"
  ];

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white pt-24 pb-20">
      <Helmet>
        <title>Visi & Misi | SMP Muhammadiyah 35 Jakarta</title>
        <meta name="description" content="Visi dan Misi SMP Muhammadiyah 35 Jakarta dalam mencetak generasi Islami yang unggul dan berkarakter." />
      </Helmet>

      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
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
            Visi & Misi
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Komitmen kami dalam mewujudkan pendidikan berkualitas yang Islami dan berwawasan global
          </p>
        </motion.div>

        {/* Visi Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-[#5D9CEC] to-[#4A89DC] rounded-3xl p-8 md:p-12 shadow-2xl text-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Target size={32} />
              </div>
              <h2 className="font-poppins text-3xl md:text-4xl font-bold">Visi</h2>
            </div>
            <p className="text-lg md:text-xl leading-relaxed">
              Terwujudnya generasi yang berakhlakul karimah, cerdas, kreatif, mandiri, dan berwawasan global berdasarkan nilai-nilai Islam dan Kemuhammadiyahan.
            </p>
          </div>
        </motion.div>

        {/* Misi Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-[#E8F4F8] rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={32} className="text-[#5D9CEC]" />
              </div>
              <h2 className="font-poppins text-3xl md:text-4xl font-bold text-gray-800">Misi</h2>
            </div>
            
            <div className="space-y-4">
              {missionItems.map((mission, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#E8F4F8] transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[#5D9CEC] rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed flex-1">
                    {mission}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VisionMissionPage;
