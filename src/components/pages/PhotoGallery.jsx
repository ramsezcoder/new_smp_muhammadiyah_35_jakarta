import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';

// STATIC PHOTO GALLERY - NO JSON - 20 PHOTOS
const PHOTOS = [
  { id: 1, title: 'Kegiatan Belajar Mengajar', category: 'Akademik' },
  { id: 2, title: 'Upacara Bendera', category: 'Kegiatan Sekolah' },
  { id: 3, title: 'Praktikum Laboratorium IPA', category: 'Akademik' },
  { id: 4, title: 'Kegiatan Olahraga', category: 'Ekstrakurikuler' },
  { id: 5, title: 'Pembelajaran Tahfidz', category: 'Keagamaan' },
  { id: 6, title: 'Kompetisi Sains', category: 'Prestasi' },
  { id: 7, title: 'Kegiatan Pramuka', category: 'Ekstrakurikuler' },
  { id: 8, title: 'Peringatan Hari Besar Islam', category: 'Keagamaan' },
  { id: 9, title: 'Perpustakaan Sekolah', category: 'Fasilitas' },
  { id: 10, title: 'Kegiatan Seni dan Budaya', category: 'Ekstrakurikuler' },
  { id: 11, title: 'Ruang Kelas', category: 'Fasilitas' },
  { id: 12, title: 'Lomba Pidato', category: 'Prestasi' },
  { id: 13, title: 'Pembelajaran Komputer', category: 'Akademik' },
  { id: 14, title: 'Kegiatan Bakti Sosial', category: 'Kegiatan Sekolah' },
  { id: 15, title: 'Pekan Olahraga', category: 'Ekstrakurikuler' },
  { id: 16, title: 'Wisuda Tahfidz', category: 'Keagamaan' },
  { id: 17, title: 'Study Tour', category: 'Kegiatan Sekolah' },
  { id: 18, title: 'Aula Sekolah', category: 'Fasilitas' },
  { id: 19, title: 'Kegiatan English Club', category: 'Ekstrakurikuler' },
  { id: 20, title: 'Lapangan Olahraga', category: 'Fasilitas' }
];

const PhotoGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  console.log('✅ PHOTO GALLERY LOADED - STATIC MODE');
  console.log('✅ Photo count:', PHOTOS.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white pt-24 pb-20">
      <Helmet>
        <title>Galeri Foto | SMP Muhammadiyah 35 Jakarta</title>
        <meta name="description" content="Dokumentasi kegiatan dan prestasi siswa SMP Muhammadiyah 35 Jakarta." />
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
            Galeri Foto
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Dokumentasi kegiatan dan momen berharga di SMP Muhammadiyah 35 Jakarta
          </p>
        </motion.div>

        {/* Photo Grid - ALWAYS SHOW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PHOTOS.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => setSelectedImage(photo)}
            >
              <div className="aspect-square overflow-hidden bg-gradient-to-br from-[#D4E8F0] to-[#E8F4F8] flex items-center justify-center">
                {/* Photo placeholder - titles only for now */}
                <div className="text-center p-4">
                  <div className="text-gray-400 text-5xl font-light mb-4">📷</div>
                  <p className="text-gray-600 text-sm font-medium">{photo.title}</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-xs font-medium mb-1 text-[#5D9CEC]">{photo.category}</p>
                  <h3 className="font-poppins text-lg font-bold">{photo.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-[#5D9CEC] transition-colors"
              >
                <X size={32} />
              </button>
              <div className="bg-gradient-to-br from-[#D4E8F0] to-[#E8F4F8] rounded-2xl shadow-2xl p-12 text-center">
                <div className="text-gray-400 text-9xl mb-8">📷</div>
                <p className="text-sm text-[#5D9CEC] mb-2">{selectedImage.category}</p>
                <h3 className="text-2xl font-bold text-gray-800">{selectedImage.title}</h3>
                <p className="text-gray-600 mt-4">Image placeholder - akan diganti dengan foto asli</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoGallery;
