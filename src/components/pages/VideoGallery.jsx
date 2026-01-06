import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';

const VideoGallery = () => {
  const videos = [
    {
      id: 1,
      title: "Profil SMP Muhammadiyah 35 Jakarta",
      category: "Profil Sekolah",
      embedId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
      description: "Video profil sekolah yang menampilkan fasilitas dan keunggulan"
    },
    {
      id: 2,
      title: "Kegiatan Pembelajaran Virtual",
      category: "Akademik",
      embedId: "dQw4w9WgXcQ",
      description: "Dokumentasi pembelajaran daring selama pandemi"
    },
    {
      id: 3,
      title: "Pentas Seni Tahunan 2024",
      category: "Ekstrakurikuler",
      embedId: "dQw4w9WgXcQ",
      description: "Penampilan siswa dalam acara pentas seni tahunan"
    },
    {
      id: 4,
      title: "Lomba Cerdas Cermat",
      category: "Prestasi",
      embedId: "dQw4w9WgXcQ",
      description: "Kompetisi akademik tingkat kota"
    },
    {
      id: 5,
      title: "Kegiatan Pesantren Kilat",
      category: "Keagamaan",
      embedId: "dQw4w9WgXcQ",
      description: "Kegiatan keagamaan selama bulan Ramadhan"
    },
    {
      id: 6,
      title: "Study Tour Bandung",
      category: "Study Tour",
      embedId: "dQw4w9WgXcQ",
      description: "Kunjungan edukatif ke berbagai tempat bersejarah"
    },
    {
      id: 7,
      title: "Turnamen Futsal Antar Kelas",
      category: "Olahraga",
      embedId: "dQw4w9WgXcQ",
      description: "Kompetisi olahraga internal sekolah"
    },
    {
      id: 8,
      title: "Wisuda Angkatan 2024",
      category: "Kelulusan",
      embedId: "dQw4w9WgXcQ",
      description: "Pelepasan siswa kelas 9 angkatan 2024"
    },
    {
      id: 9,
      title: "Praktikum Sains",
      category: "Akademik",
      embedId: "dQw4w9WgXcQ",
      description: "Kegiatan praktikum di laboratorium IPA"
    }
  ];

  const navigate = useNavigate();

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
