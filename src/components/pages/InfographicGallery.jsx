import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Eye } from 'lucide-react';

const InfographicGallery = () => {
  const infographics = [
    {
      id: 1,
      title: "Profil Sekolah 2024",
      category: "Informasi Sekolah",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=900&fit=crop",
      description: "Infografis lengkap tentang profil SMP Muhammadiyah 35 Jakarta"
    },
    {
      id: 2,
      title: "Prestasi Akademik",
      category: "Prestasi",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=900&fit=crop",
      description: "Rangkuman prestasi akademik siswa tahun 2024"
    },
    {
      id: 3,
      title: "Panduan PPDB 2024/2025",
      category: "PPDB",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=900&fit=crop",
      description: "Informasi lengkap pendaftaran peserta didik baru"
    },
    {
      id: 4,
      title: "Fasilitas Sekolah",
      category: "Fasilitas",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=900&fit=crop",
      description: "Daftar fasilitas dan sarana pembelajaran"
    },
    {
      id: 5,
      title: "Ekstrakurikuler",
      category: "Kegiatan",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=900&fit=crop",
      description: "Beragam pilihan kegiatan ekstrakurikuler"
    },
    {
      id: 6,
      title: "Kalender Akademik",
      category: "Informasi Sekolah",
      image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=900&fit=crop",
      description: "Jadwal kegiatan akademik tahun ajaran 2024/2025"
    },
    {
      id: 7,
      title: "Protokol Kesehatan",
      category: "Kesehatan",
      image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&h=900&fit=crop",
      description: "Panduan protokol kesehatan di lingkungan sekolah"
    },
    {
      id: 8,
      title: "Tips Belajar Efektif",
      category: "Akademik",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=900&fit=crop",
      description: "Metode belajar yang efektif untuk siswa SMP"
    },
    {
      id: 9,
      title: "Struktur Organisasi",
      category: "Informasi Sekolah",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=900&fit=crop",
      description: "Struktur organisasi sekolah tahun 2024"
    },
    {
      id: 10,
      title: "Program Unggulan",
      category: "Program",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=900&fit=crop",
      description: "Program-program unggulan sekolah"
    },
    {
      id: 11,
      title: "Beasiswa Prestasi",
      category: "Beasiswa",
      image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=900&fit=crop",
      description: "Informasi program beasiswa untuk siswa berprestasi"
    },
    {
      id: 12,
      title: "Karakter Islami",
      category: "Pendidikan Karakter",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=900&fit=crop",
      description: "Pembentukan karakter Islami pada siswa"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white pt-24 pb-20">
      <Helmet>
        <title>Galeri Infografis | SMP Muhammadiyah 35 Jakarta</title>
        <meta name="description" content="Kumpulan infografis informasi dan data sekolah SMP Muhammadiyah 35 Jakarta." />
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
          className="text-center mb-12"
        >
          <h1 className="font-poppins text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Galeri Infografis
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Informasi visual seputar profil, prestasi, dan kegiatan sekolah
          </p>
        </motion.div>

        {/* Infographic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {infographics.map((infographic, index) => (
            <motion.div
              key={infographic.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
            >
              {/* Infographic Image */}
              <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
                <img 
                  src={infographic.image} 
                  alt={infographic.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xs font-medium text-[#5D9CEC] mb-2">
                      {infographic.category}
                    </p>
                    <h3 className="font-poppins text-lg font-bold text-white mb-3">
                      {infographic.title}
                    </h3>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
                        <Eye size={16} />
                        Lihat
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-[#5D9CEC] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#4A89DC] transition-colors">
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="p-4">
                <span className="inline-block px-3 py-1 bg-[#E8F4F8] text-[#5D9CEC] text-xs font-medium rounded-full mb-2">
                  {infographic.category}
                </span>
                <h3 className="font-poppins text-base font-bold text-gray-800 mb-1 line-clamp-1">
                  {infographic.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {infographic.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Note */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        >
          <h3 className="font-poppins text-xl font-bold text-gray-800 mb-4">
            💡 Informasi
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Semua infografis dapat diunduh dan dibagikan untuk keperluan informasi. Untuk mendapatkan file resolusi tinggi atau permintaan desain khusus, silakan hubungi bagian Humas sekolah melalui email atau WhatsApp yang tertera di footer.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default InfographicGallery;
