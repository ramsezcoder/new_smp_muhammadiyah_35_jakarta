import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, Film } from 'lucide-react';

const GalleryIndexPage = () => {
  const navigate = useNavigate();

  const galleryOptions = [
    {
      id: 1,
      title: "Galeri Foto",
      description: "Dokumentasi kegiatan dan momen berharga",
      icon: Image,
      path: "/gallery/photos",
      color: "from-blue-400 to-blue-600",
      count: "50+ foto"
    },
    {
      id: 2,
      title: "Galeri Video",
      description: "Video dokumentasi acara dan kegiatan sekolah",
      icon: Film,
      path: "/gallery/videos",
      color: "from-purple-400 to-purple-600",
      count: "15+ video"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white pt-24 pb-20">
      <Helmet>
        <title>Galeri | SMP Muhammadiyah 35 Jakarta</title>
        <meta name="description" content="Jelajahi galeri foto, video, dan infografis prestasi SMP Muhammadiyah 35 Jakarta." />
        <meta name="robots" content="index, follow" />
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
            Galeri
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Jelajahi dokumentasi lengkap kegiatan, prestasi, dan momen spesial SMP Muhammadiyah 35 Jakarta
          </p>
        </motion.div>

        {/* Gallery Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {galleryOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => navigate(option.path)}
                className="group cursor-pointer h-full"
              >
                <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#5D9CEC]">
                  {/* Gradient Background */}
                  <div className={`bg-gradient-to-br ${option.color} h-40 flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                      <Icon size={120} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-30" />
                    </div>
                    <Icon size={60} className="text-white relative z-10" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="font-poppins font-bold text-xl text-gray-800 mb-2">
                      {option.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      {option.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#5D9CEC] bg-blue-50 px-3 py-1 rounded-full">
                        {option.count}
                      </span>
                      <span className="text-[#5D9CEC] group-hover:translate-x-1 transition-transform duration-300">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 bg-blue-50 rounded-2xl p-8 border border-blue-200 max-w-3xl mx-auto"
        >
          <h3 className="font-poppins font-bold text-lg text-gray-800 mb-4">
            💡 Tips Navigasi
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Klik pada kartu untuk menjelajahi galeri yang diinginkan</li>
            <li>✓ Gunakan fitur zoom untuk melihat detail foto dengan lebih jelas</li>
            <li>✓ Cek update galeri secara berkala untuk konten terbaru</li>
            <li>✓ Hubungi sekolah untuk penggunaan foto komersial</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default GalleryIndexPage;
