import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { db } from '@/lib/db';

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/gallery');
        const json = await res.json();
        const stored = json.items || [];
        if (stored.length) {
          setGalleryImages(stored.slice(0, 6).map((img, idx) => ({
            id: img.id || idx,
            caption: db.formatName(img.name || img.filename) || 'Galeri Sekolah',
            description: img.description || 'Dokumentasi kegiatan sekolah',
            src: img.url,
            altText: img.altText || `${img.name || 'Foto'} SMP Muhammadiyah 35 Jakarta`,
            seoTitle: img.seoTitle || img.name || 'Dokumentasi'
          })));
          return;
        }
      } catch (e) {
        console.warn('[gallery] load failed', e.message);
      }
    };
    load();

    setGalleryImages([
      { id: 1, caption: 'Kegiatan Pembelajaran', description: 'Suasana belajar yang kondusif di kelas', src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7', altText: 'Kegiatan pembelajaran di kelas SMP Muhammadiyah 35 Jakarta', seoTitle: 'Kegiatan Pembelajaran' },
      { id: 2, caption: 'Laboratorium Komputer', description: 'Fasilitas komputer modern untuk siswa', src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3', altText: 'Laboratorium komputer SMP Muhammadiyah 35 Jakarta', seoTitle: 'Laboratorium Komputer' },
      { id: 3, caption: 'Perpustakaan Sekolah', description: 'Koleksi buku lengkap untuk literasi', src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570', altText: 'Perpustakaan SMP Muhammadiyah 35 Jakarta', seoTitle: 'Perpustakaan' },
      { id: 4, caption: 'Kegiatan Tahfidz', description: 'Pembiasaan menghafal Al-Quran', src: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5', altText: 'Kegiatan tahfidz Al-Quran', seoTitle: 'Tahfidz' },
      { id: 5, caption: 'Lapangan Olahraga', description: 'Area olahraga yang luas dan representatif', src: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e', altText: 'Lapangan olahraga sekolah', seoTitle: 'Lapangan Olahraga' },
      { id: 6, caption: 'Ekstrakurikuler', description: 'Pengembangan minat dan bakat siswa', src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18', altText: 'Kegiatan ekstrakurikuler siswa', seoTitle: 'Ekstrakurikuler' },
    ]);
  }, []);

  return (
    <section id="gallery" className="py-12 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#E8F4F8] px-3 py-1 md:px-4 md:py-2 rounded-full mb-3 md:mb-4">
            <ImageIcon className="w-3 h-3 md:w-4 md:h-4 text-[#5D9CEC]" />
            <span className="text-[#5D9CEC] text-[10px] md:text-xs font-bold uppercase tracking-wider">Dokumentasi</span>
          </div>
          <h2 className="font-poppins text-2xl md:text-4xl font-bold text-gray-800">
            Galeri Kegiatan Sekolah
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 aspect-[4/3]"
              onClick={() => setSelectedImage(image)}
            >
              <img 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={image.altText || image.caption}
                title={image.seoTitle || image.caption}
                src={image.src} 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#5D9CEC]/90 via-[#5D9CEC]/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-bold text-lg mb-1">{image.caption}</h3>
                  <p className="text-white/90 text-sm font-light">{image.description}</p>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <ZoomIn className="w-6 h-6 text-[#5D9CEC]" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors p-2 bg-white/10 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl" 
                alt={selectedImage.caption}
                src={selectedImage.src} 
              />
              <div className="mt-6 text-center">
                <h3 className="text-white text-xl font-bold mb-2">{selectedImage.caption}</h3>
                <p className="text-gray-300">{selectedImage.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;