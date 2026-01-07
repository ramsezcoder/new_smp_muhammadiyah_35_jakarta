import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';

const VideoGallery = () => {
  const navigate = useNavigate();
  // STATIC VIDEO LIST - NO JSON/LOCALSTORAGE
  const videos = [
    { id: 1, title: 'Profil Sekolah', category: 'Profil', embedId: 'dQw4w9WgXcQ', description: 'Gambaran umum SMP Muhammadiyah 35 Jakarta.' },
    { id: 2, title: 'Kegiatan Belajar', category: 'Akademik', embedId: 'ysz5S6PUM-U', description: 'Suasana belajar interaktif di kelas.' },
    { id: 3, title: 'Ekstrakurikuler', category: 'Kegiatan', embedId: '3GwjfUFyY6M', description: 'Pilihan ekstrakurikuler untuk pengembangan siswa.' },
    { id: 4, title: 'Prestasi Siswa', category: 'Prestasi', embedId: 'V-_O7nl0Ii0', description: 'Rangkaian prestasi siswa di berbagai bidang.' },
    { id: 5, title: 'Tahfidz & Keagamaan', category: 'Keagamaan', embedId: 'a3Z7zEc7AXQ', description: 'Program tahfidz dan kegiatan keagamaan sekolah.' },
    { id: 6, title: 'Fasilitas Sekolah', category: 'Fasilitas', embedId: 'eX2qFMC8cFo', description: 'Tur singkat fasilitas pendukung belajar.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white pt-24 pb-20">
      <Helmet>
        <title>Galeri Video | SMP Muhammadiyah 35 Jakarta</title>
        <meta name="description" content="Koleksi video kegiatan dan prestasi siswa SMP Muhammadiyah 35 Jakarta." />
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
          className="text-center mb-12"
        >
          <h1 className="font-poppins text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Galeri Video
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Dokumentasi video berbagai kegiatan dan prestasi di SMP Muhammadiyah 35 Jakarta
          </p>
        </motion.div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center mb-16">
            <p className="text-gray-600 text-lg mb-2">Belum ada video galeri yang ditambahkan.</p>
            <p className="text-gray-400 text-sm">Admin dapat mengelola video dari dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
            >
              {/* Video Embed */}
              <div className="relative aspect-video bg-gray-900">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${video.embedId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
                {/* Play Overlay - Optional decorative element */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#5D9CEC]/80 rounded-full flex items-center justify-center">
                    <Play size={28} className="text-white ml-1" />
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5">
                <span className="inline-block px-3 py-1 bg-[#E8F4F8] text-[#5D9CEC] text-xs font-medium rounded-full mb-3">
                  {video.category}
                </span>
                <h3 className="font-poppins text-xl font-bold text-gray-800 mb-2 group-hover:text-[#5D9CEC] transition-colors">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {video.description}
                </p>
              </div>
            </motion.div>
          ))}
          </div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 bg-gradient-to-br from-[#5D9CEC] to-[#4A89DC] rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl"
        >
          <h3 className="font-poppins text-2xl md:text-3xl font-bold mb-4">
            Ikuti Channel YouTube Kami
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Subscribe untuk mendapatkan update video terbaru seputar kegiatan sekolah
          </p>
          <a
            href="https://www.youtube.com/@smpmuhammadiyah35jakarta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#5D9CEC] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            <Play size={20} />
            Subscribe Sekarang
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoGallery;
