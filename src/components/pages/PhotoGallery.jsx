import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { db } from '@/lib/db';

const PhotoGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/gallery/list.php?published=1&limit=100');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Load failed');
        const stored = json.data?.items || [];
        if (stored.length) {
          const uploadedPhotos = stored.map((img, idx) => ({
            id: img.id || idx,
            title: db.formatName(img.title || img.filename) || 'Dokumentasi Sekolah',
            category: img.category || 'Galeri',
            image: img.url,
            altText: img.alt_text || `${img.title || 'Foto'} SMP Muhammadiyah 35 Jakarta`,
            seoTitle: img.title || 'Dokumentasi'
          }));
          setPhotos(uploadedPhotos);
        } else {
          setPhotos([]);
        }
      } catch (e) {
        console.warn('[PhotoGallery] API load failed:', e.message);
        setPhotos([]);
      }
    };
    load();
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
        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <p className="text-gray-600 text-lg mb-2">Belum ada foto galeri yang ditambahkan.</p>
            <p className="text-gray-400 text-sm">Admin dapat mengelola galeri dari dashboard.</p>
          </div>
        ) : (
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
                  alt={photo.altText || photo.title}
                  title={photo.seoTitle || photo.title}
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
        )}
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
