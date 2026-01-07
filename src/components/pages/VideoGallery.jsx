import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';

const VideoGallery = () => {
  const navigate = useNavigate();
  
  // STATIC VIDEO LIST - OFFICIAL CHANNEL VIDEOS
  const videos = [
    {
      id: 1,
      title: "Detik-Detik Penghormatan Bendera Merah Putih: Merinding! Momen Bersejarah di Cipulir",
      url: "https://www.youtube.com/watch?v=NELU3RZbL9Q",
      videoId: "NELU3RZbL9Q",
      description: "Kibarkan Semangat Merah Putih! Saksikan momen epik yang menggetarkan hati saat masyarakat dari berbagai kalangan bersatu padu dalam penghormatan bendera merah putih di Persimpangan SESKOAL"
    },
    {
      id: 2,
      title: "HARI GURU DAN PENYERAHAN HADIAH SISWA BERPRESTASI",
      url: "https://www.youtube.com/watch?v=euHvWzW2mS0",
      videoId: "euHvWzW2mS0",
      description: "HARI GURU DAN PENYERAHAN HADIAH SISWA BERPRESTASI"
    },
    {
      id: 3,
      title: "Company Profile SMP Muhammadiyah 35 - 2023/2024",
      url: "https://www.youtube.com/watch?v=m120qx5WaUM",
      videoId: "m120qx5WaUM",
      description: "Company Profile SMP Muhammadiyah 35 - 2023/2024"
    },
    {
      id: 4,
      title: "Tari Laskar Budaya - SMP Muhammadiyah 35 Jakarta",
      url: "https://www.youtube.com/watch?v=oBRIeFQ1Ob4",
      videoId: "oBRIeFQ1Ob4",
      description: "Tim Tari"
    }
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

        {/* Video Grid - 2x2 Layout */}
        {videos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center mb-16">
            <p className="text-gray-600 text-lg mb-2">Belum ada video galeri yang ditambahkan.</p>
            <p className="text-gray-400 text-sm">Admin dapat mengelola video dari dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
            >
              {/* Video Thumbnail with Link */}
              <a 
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-video bg-gray-900 overflow-hidden"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#5D9CEC] group-hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg">
                    <Play size={28} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              </a>

              {/* Video Info */}
              <div className="p-6">
                <h3 className="font-poppins text-xl font-bold text-gray-800 mb-3 group-hover:text-[#5D9CEC] transition-colors line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {video.description}
                </p>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#5D9CEC] hover:text-[#4A89DC] font-semibold text-sm transition-colors"
                >
                  <Play size={16} />
                  Tonton di YouTube
                </a>
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
            href="https://www.youtube.com/@smpmuh_35"
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
