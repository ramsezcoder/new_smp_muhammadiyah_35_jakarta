import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';

const PhotoGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [photos, setPhotos] = useState([]);

  const defaultPhotos = [
    { id: 1, title: "Upacara Bendera", category: "Kegiatan Rutin", image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop" },
    { id: 2, title: "Kegiatan Pembelajaran", category: "Akademik", image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop" },
    { id: 3, title: "Lomba Sains", category: "Prestasi", image: "https://images.unsplash.com/photo-1532153955177-f59af40d6472?w=800&h=600&fit=crop" },
    { id: 4, title: "Kegiatan Olahraga", category: "Ekstrakurikuler", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop" },
    { id: 5, title: "Pesantren Kilat", category: "Keagamaan", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop" },
    { id: 6, title: "Praktikum Laboratorium", category: "Akademik", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop" },
    { id: 7, title: "Pentas Seni", category: "Ekstrakurikuler", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop" },
    { id: 8, title: "Wisuda Angkatan", category: "Kegiatan Rutin", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop" },
    { id: 9, title: "Kegiatan Pramuka", category: "Ekstrakurikuler", image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop" },
    { id: 10, title: "Kunjungan Museum", category: "Study Tour", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop" },
    { id: 11, title: "Kompetisi Robotik", category: "Prestasi", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop" },
    { id: 12, title: "Peringatan Hari Besar", category: "Keagamaan", image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&h=600&fit=crop" }
  ];

  useEffect(() => {
    // Load uploaded images from localStorage and merge with defaults
    try {
      const uploadedImages = JSON.parse(localStorage.getItem('gallery_uploads') || '[]');
      const uploadedPhotos = uploadedImages.map((img, idx) => ({
        id: img.id || 1000 + idx,
        title: img.name || img.filename || 'Uploaded Photo',
        category: 'Galeri Unggahan',
        image: img.dataUrl || img.originalUrl || img.url
      }));
      setPhotos([...uploadedPhotos, ...defaultPhotos]);
    } catch (err) {
      console.warn('[gallery] Failed to load uploaded images:', err);
      setPhotos(defaultPhotos);
    }
  }, []);

  const navigate = useNavigate();

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

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => setSelectedImage(photo)}
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img 
                  src={photo.image} 
                  alt={photo.title}
                  onError={(e) => {
                    console.warn('[gallery] image failed to load:', photo.title);
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
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
              <img 
                src={selectedImage.image} 
                alt={selectedImage.title}
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-[#5D9CEC] mb-2">{selectedImage.category}</p>
                <h3 className="text-2xl font-bold text-white">{selectedImage.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoGallery;
