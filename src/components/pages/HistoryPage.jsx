import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Award, Building2 } from 'lucide-react';

const HistoryPage = () => {
  const milestones = [
    {
      year: "1986",
      title: "Era Perintisan",
      description: "Sekolah resmi didirikan pada tahun 1986 atas prakarsa H.S. Prodjokusumo, tokoh Muhammadiyah yang memiliki militansi tinggi dalam menggerakkan organisasi dan mendorong berdirinya lembaga pendidikan formal di Jakarta.",
      icon: Building2
    },
    {
      year: "17 Maret 1986",
      title: "Legalisasi dan Pengukuhan Status",
      description: "Penerbitan Surat Keputusan Pendirian Sekolah No. SP. 567/101.1A/I86 yang menjadi tonggak sejarah resmi dimulainya kegiatan belajar mengajar di bawah naungan Majelis Dikdasmen Muhammadiyah.",
      icon: Award
    },
    {
      year: "29 Juni 2012",
      title: "Keberlanjutan dan Legalitas Modern",
      description: "Diterbitkan SK Izin Operasional terbaru sebagai wujud kepatuhan pada regulasi pemerintah dan komitmen peningkatan mutu pendidikan. Sekolah terdaftar di Dapodik Kemendikbud dengan NPSN: 20106980.",
      icon: Award
    }
  ];

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white pt-24 pb-20">
      <Helmet>
        <title>Sejarah | SMP Muhammadiyah 35 Jakarta</title>
        <meta name="description" content="Sejarah perjalanan SMP Muhammadiyah 35 Jakarta sejak berdiri hingga menjadi lembaga pendidikan yang berkualitas." />
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
          className="text-center mb-16"
        >
          <h1 className="font-poppins text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Sejarah dan Perkembangan SMP Muhammadiyah 35 Jakarta
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Amal usaha Muhammadiyah di bidang pendidikan yang berdiri sejak 1986
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-16"
        >
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              SMP Muhammadiyah 35 Jakarta merupakan salah satu amal usaha Muhammadiyah di bidang pendidikan yang berlokasi di Jakarta Selatan. Sekolah ini berdiri sebagai wujud nyata komitmen persyarikatan dalam mencerdaskan kehidupan bangsa melalui pendidikan yang berlandaskan nilai-nilai Islam dan Kemuhammadiyahan.
            </p>

            <div>
              <h3 className="font-poppins text-xl font-bold text-gray-800 mb-3">1. Era Perintisan dan Peran H.S. Prodjokusumo (1986)</h3>
              <p>
                Sekolah ini resmi didirikan pada tahun 1986. Periode pertengahan tahun 80-an merupakan masa yang sangat dinamis bagi perkembangan Muhammadiyah di DKI Jakarta. Pada masa ini, ekspansi amal usaha—khususnya sekolah dan masjid—sedang digencarkan untuk menjangkau kebutuhan umat di berbagai pelosok ibu kota.
              </p>
              <p className="mt-3">
                Pendirian SMP Muhammadiyah 35 Jakarta tidak dapat dilepaskan dari peran besar tokoh Muhammadiyah, H.S. Prodjokusumo. Beliau dikenal memiliki militansi tinggi dalam menggerakkan organisasi dan mendorong berdirinya lembaga pendidikan formal di berbagai wilayah Jakarta. Semangat dakwah inilah yang kemudian melahirkan SMP Muhammadiyah 35 Jakarta.
              </p>
              <p className="mt-3">
                Sekolah ini hadir bukan hanya sebagai tempat pendidikan akademik, tetapi juga sebagai pusat pembinaan akhlak mulia bagi generasi muda agar berkarakter Islami.
              </p>
            </div>

            <div>
              <h3 className="font-poppins text-xl font-bold text-gray-800 mb-3">2. Legalisasi dan Pengukuhan Status</h3>
              <p>
                Secara administratif, keberadaan sekolah ini dikukuhkan melalui Surat Keputusan (SK) Pendirian Sekolah pada tanggal <strong>17 Maret 1986</strong> dengan Nomor <strong>SP. 567/101.1A/I86</strong>.
              </p>
              <p className="mt-3">
                SK ini menjadi tonggak sejarah resmi dimulainya kegiatan belajar mengajar di SMP Muhammadiyah 35 Jakarta di bawah naungan Majelis Dikdasmen Muhammadiyah.
              </p>
            </div>

            <div>
              <h3 className="font-poppins text-xl font-bold text-gray-800 mb-3">3. Keberlanjutan dan Legalitas Modern</h3>
              <p>
                Dalam perjalanannya, sekolah terus melakukan pembenahan manajemen serta peningkatan mutu pendidikan. Sebagai wujud kepatuhan pada regulasi pemerintah, diterbitkan SK Izin Operasional terbaru pada tanggal <strong>29 Juni 2012</strong>.
              </p>
              <p className="mt-3">
                Saat ini SMP Muhammadiyah 35 Jakarta terdaftar di Data Pokok Pendidikan (Dapodik) Kemendikbud dengan Nomor Pokok Sekolah Nasional (NPSN): <strong>20106980</strong>.
              </p>
            </div>

            <div>
              <h3 className="font-poppins text-xl font-bold text-gray-800 mb-3">4. Penutup</h3>
              <p>
                Sejak 1986 hingga kini, SMP Muhammadiyah 35 Jakarta terus berkomitmen mencetak generasi Islam yang cerdas, berkarakter, dan bermanfaat bagi umat serta bangsa, sejalan dengan cita-cita dakwah Muhammadiyah.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-[#5D9CEC] to-[#4A89DC] h-full"></div>

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
                    <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                      <div className="w-12 h-12 bg-[#E8F4F8] rounded-xl flex items-center justify-center">
                        <milestone.icon size={24} className="text-[#5D9CEC]" />
                      </div>
                      <span className="font-poppins text-3xl font-bold text-[#5D9CEC]">
                        {milestone.year}
                      </span>
                    </div>
                    <h3 className="font-poppins text-xl md:text-2xl font-bold text-gray-800 mb-3">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="hidden md:flex flex-shrink-0 w-6 h-6 bg-[#5D9CEC] rounded-full border-4 border-white shadow-lg z-10"></div>

                {/* Spacer */}
                <div className="hidden md:block flex-1"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Closing Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-16 bg-gradient-to-br from-[#5D9CEC] to-[#4A89DC] rounded-3xl p-8 md:p-12 shadow-2xl text-white"
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="font-poppins text-2xl md:text-3xl font-bold mb-6 text-center">
              Ringkasan Data Sekolah
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-lg">
              <div>
                <p className="font-semibold mb-1">Nama</p>
                <p className="opacity-90">SMP Muhammadiyah 35 Jakarta</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Tanggal Berdiri</p>
                <p className="opacity-90">17 Maret 1986</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Nomor SK</p>
                <p className="opacity-90">SP. 567/101.1A/I86</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Izin Operasional Terbaru</p>
                <p className="opacity-90">29 Juni 2012</p>
              </div>
              <div>
                <p className="font-semibold mb-1">NPSN</p>
                <p className="opacity-90">20106980</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Afiliasi</p>
                <p className="opacity-90">Persyarikatan Muhammadiyah</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HistoryPage;
