import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Eye, BookOpen, FileText } from 'lucide-react';

const EModulePage = () => {
  const modules = [
    {
      id: 1,
      subject: "PKN",
      title: "Pendidikan Kewarganegaraan",
      description: "Materi PKN lengkap kelas 7, 8, dan 9 meliputi Pancasila, UUD 1945, dan nilai-nilai kebangsaan",
      icon: "📘",
      size: "2.5 MB",
      pages: 45
    },
    {
      id: 2,
      subject: "Bahasa Indonesia",
      title: "Bahasa Indonesia",
      description: "Modul pembelajaran bahasa Indonesia mencakup tata bahasa, sastra, dan keterampilan menulis",
      icon: "📖",
      size: "3.2 MB",
      pages: 58
    },
    {
      id: 3,
      subject: "Matematika",
      title: "Matematika",
      description: "E-modul matematika dengan pembahasan aljabar, geometri, statistika dan latihan soal",
      icon: "🔢",
      size: "4.1 MB",
      pages: 72
    },
    {
      id: 4,
      subject: "IPA",
      title: "Ilmu Pengetahuan Alam",
      description: "Materi IPA terpadu meliputi Fisika, Biologi, dan Kimia dengan ilustrasi lengkap",
      icon: "🔬",
      size: "5.8 MB",
      pages: 95
    },
    {
      id: 5,
      subject: "IPS",
      title: "Ilmu Pengetahuan Sosial",
      description: "Modul IPS mencakup Geografi, Sejarah, Ekonomi, dan Sosiologi",
      icon: "🌍",
      size: "3.9 MB",
      pages: 68
    },
    {
      id: 6,
      subject: "Bahasa Inggris",
      title: "English Language",
      description: "English learning module with grammar, vocabulary, reading and conversation practice",
      icon: "🇬🇧",
      size: "3.5 MB",
      pages: 62
    },
    {
      id: 7,
      subject: "PAI",
      title: "Pendidikan Agama Islam",
      description: "Materi PAI meliputi Al-Quran Hadits, Akidah Akhlak, Fiqih, dan Sejarah Islam",
      icon: "☪️",
      size: "4.2 MB",
      pages: 78
    },
    {
      id: 8,
      subject: "Seni Budaya",
      title: "Seni Budaya",
      description: "Modul seni mencakup seni rupa, seni musik, seni tari, dan apresiasi seni",
      icon: "🎨",
      size: "6.3 MB",
      pages: 85
    },
    {
      id: 9,
      subject: "PJOK",
      title: "Pendidikan Jasmani Olahraga & Kesehatan",
      description: "Materi PJOK teori dan praktik olahraga serta pendidikan kesehatan",
      icon: "⚽",
      size: "2.8 MB",
      pages: 48
    },
    {
      id: 10,
      subject: "Prakarya",
      title: "Prakarya dan Kewirausahaan",
      description: "E-modul prakarya dengan berbagai kreasi dan pengembangan jiwa wirausaha",
      icon: "🛠️",
      size: "4.5 MB",
      pages: 65
    },
    {
      id: 11,
      subject: "Bahasa Arab",
      title: "Bahasa Arab",
      description: "Pembelajaran bahasa Arab dasar hingga menengah dengan kosakata dan tata bahasa",
      icon: "🕌",
      size: "3.1 MB",
      pages: 52
    },
    {
      id: 12,
      subject: "Kemuhammadiyahan",
      title: "Al-Islam & Kemuhammadiyahan",
      description: "Materi khusus tentang sejarah, gerakan, dan nilai-nilai Muhammadiyah",
      icon: "⭐",
      size: "2.9 MB",
      pages: 44
    },
    {
      id: 13,
      subject: "Informatika",
      title: "Informatika & TIK",
      description: "Modul pembelajaran teknologi informasi, coding, dan literasi digital",
      icon: "💻",
      size: "5.2 MB",
      pages: 82
    },
    {
      id: 14,
      subject: "BK",
      title: "Bimbingan Konseling",
      description: "Panduan pengembangan diri, karir, dan konseling pribadi-sosial",
      icon: "🎯",
      size: "2.1 MB",
      pages: 38
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white pt-24 pb-20">
      <Helmet>
        <title>E-Modul Pembelajaran | SMP Muhammadiyah 35 Jakarta</title>
        <meta name="description" content="Akses e-modul pembelajaran digital untuk semua mata pelajaran di SMP Muhammadiyah 35 Jakarta." />
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
              <BookOpen size={40} className="text-white" />
            </div>
          </div>
          <h1 className="font-poppins text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            E-Modul Pembelajaran
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Akses materi pembelajaran digital untuk semua mata pelajaran. Download atau baca online untuk mendukung kegiatan belajar Anda.
          </p>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg text-center"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-poppins font-bold text-gray-800 mb-2">14 Mata Pelajaran</h3>
            <p className="text-gray-600 text-sm">Lengkap semua mapel</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg text-center"
          >
            <div className="text-4xl mb-3">🔄</div>
            <h3 className="font-poppins font-bold text-gray-800 mb-2">Update Berkala</h3>
            <p className="text-gray-600 text-sm">Materi selalu terbaru</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg text-center"
          >
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-poppins font-bold text-gray-800 mb-2">Akses Fleksibel</h3>
            <p className="text-gray-600 text-sm">Bisa dibuka di mana saja</p>
          </motion.div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-br from-[#5D9CEC] to-[#4A89DC] p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{module.icon}</div>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    {module.subject}
                  </span>
                </div>
                <h3 className="font-poppins text-xl font-bold mb-2">
                  {module.title}
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {module.description}
                </p>

                {/* Module Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <FileText size={16} />
                    <span>{module.pages} hal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download size={16} />
                    <span>{module.size}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-[#E8F4F8] text-[#5D9CEC] px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-[#5D9CEC] hover:text-white transition-colors">
                    <Eye size={16} />
                    Baca Online
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-[#5D9CEC] text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-[#4A89DC] transition-colors">
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-16 bg-gradient-to-br from-[#5D9CEC] to-[#4A89DC] rounded-3xl p-8 md:p-12 text-white"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-poppins text-2xl md:text-3xl font-bold mb-4">
              Butuh Bantuan?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Jika ada kesulitan mengakses atau mengunduh e-modul, silakan hubungi guru mata pelajaran atau bagian IT sekolah.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://wa.me/6287888776690"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#5D9CEC] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp Admin
              </a>
              <a
                href="mailto:smpmuh35jkt@gmail.com"
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Sekolah
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EModulePage;
