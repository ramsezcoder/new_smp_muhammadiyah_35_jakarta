import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Calendar, User } from 'lucide-react';

const PrestasiPage = () => {
  const achievements = [
    {
      id: 1,
      title: 'Juara 1 Olimpiade Matematika Tingkat Nasional',
      studentName: 'Ahmad Fauzi',
      competition: 'Olimpiade Sains Nasional (OSN) Matematika',
      year: '2025',
      category: 'Akademik',
      image: 'https://images.unsplash.com/photo-1596496050827-8299e0220de1?w=800&h=600&fit=crop'
    },
    {
      id: 2,
      title: 'Juara 2 Kompetisi Robotik ASEAN',
      studentName: 'Siti Nurhaliza',
      competition: 'ASEAN Robotic Competition 2025',
      year: '2025',
      category: 'Teknologi',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'
    },
    {
      id: 3,
      title: 'Juara 1 Lomba Tahfidz Al-Quran Tingkat DKI Jakarta',
      studentName: 'Muhammad Ridwan',
      competition: 'Musabaqah Hifzil Quran DKI Jakarta',
      year: '2024',
      category: 'Keagamaan',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop'
    },
    {
      id: 4,
      title: 'Medali Perak Olimpiade Sains Internasional',
      studentName: 'Zahra Amelia',
      competition: 'International Science Olympiad (ISO)',
      year: '2024',
      category: 'Akademik',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop'
    },
    {
      id: 5,
      title: 'Juara 1 Lomba Pidato Bahasa Inggris',
      studentName: 'Dian Pertiwi',
      competition: 'National English Speech Contest',
      year: '2024',
      category: 'Bahasa',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop'
    },
    {
      id: 6,
      title: 'Juara 3 Kompetisi Desain Grafis Nasional',
      studentName: 'Raka Pradipta',
      competition: 'Indonesia Creative Design Competition',
      year: '2024',
      category: 'Seni',
      image: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&h=600&fit=crop'
    },
    {
      id: 7,
      title: 'Juara 1 Futsal Antar SMP Se-Jakarta',
      studentName: 'Tim Futsal Putra',
      competition: 'Jakarta Junior Futsal Championship',
      year: '2024',
      category: 'Olahraga',
      image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=600&fit=crop'
    },
    {
      id: 8,
      title: 'Best Delegate Model United Nations',
      studentName: 'Alifah Zahra',
      competition: 'Jakarta Model United Nations 2024',
      year: '2024',
      category: 'Kepemimpinan',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop'
    }
  ];

  const categoryColors = {
    'Akademik': 'bg-blue-100 text-blue-700',
    'Teknologi': 'bg-purple-100 text-purple-700',
    'Keagamaan': 'bg-green-100 text-green-700',
    'Bahasa': 'bg-orange-100 text-orange-700',
    'Seni': 'bg-pink-100 text-pink-700',
    'Olahraga': 'bg-red-100 text-red-700',
    'Kepemimpinan': 'bg-indigo-100 text-indigo-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white pt-24 pb-20">
      <Helmet>
        <title>Prestasi Siswa | SMP Muhammadiyah 35 Jakarta</title>
        <meta name="description" content="Daftar prestasi dan penghargaan yang diraih siswa-siswi SMP Muhammadiyah 35 Jakarta di berbagai kompetisi tingkat lokal, nasional, dan internasional." />
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
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#5D9CEC] to-[#4A89DC] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Award size={40} className="text-white" />
            </div>
          </div>
          <h1 className="font-poppins text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Prestasi Siswa
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Bangga dengan pencapaian siswa-siswi SMP Muhammadiyah 35 Jakarta di berbagai kompetisi dan olimpiade
          </p>
        </motion.div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={achievement.image} 
                  alt={achievement.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[achievement.category]}`}>
                    {achievement.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-poppins text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-[#5D9CEC] transition-colors">
                  {achievement.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={16} className="text-[#5D9CEC]" />
                    <span>{achievement.studentName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award size={16} className="text-[#5D9CEC]" />
                    <span className="line-clamp-1">{achievement.competition}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-[#5D9CEC]" />
                    <span>{achievement.year}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-2 text-[#5D9CEC] font-medium text-sm">
                    <Award size={18} />
                    <span>Prestasi Membanggakan</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-4xl font-bold text-[#5D9CEC] mb-2">50+</div>
            <p className="text-gray-600">Prestasi Tahun Ini</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-4xl font-bold text-[#5D9CEC] mb-2">15+</div>
            <p className="text-gray-600">Juara Nasional</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-4xl font-bold text-[#5D9CEC] mb-2">5+</div>
            <p className="text-gray-600">Juara Internasional</p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-16 bg-gradient-to-br from-[#5D9CEC] to-[#4A89DC] rounded-3xl p-8 md:p-12 text-white text-center"
        >
          <h3 className="font-poppins text-2xl md:text-3xl font-bold mb-4">
            Raih Prestasi Bersama Kami
          </h3>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            Bergabunglah dengan SMP Muhammadiyah 35 Jakarta dan wujudkan potensi terbaikmu di bidang akademik maupun non-akademik
          </p>
          <button
            onClick={() => window.location.hash = '#registration'}
            className="inline-flex items-center gap-2 bg-white text-[#5D9CEC] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Daftar Sekarang
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PrestasiPage;
