import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Import staff photos
import AbuPhoto from '@/assets/abu.jpeg';
import AhmadPhoto from '@/assets/ahmad.jpeg';
import AmerzaPhoto from '@/assets/amerza.jpeg';
import AuliaPhoto from '@/assets/aulia.jpeg';
import EkoPhoto from '@/assets/eko.jpeg';
import HadiJabbarPhoto from '@/assets/hadi_jabbar.jpeg';
import HadiPrawotoPhoto from '@/assets/hadi_prawoto.jpeg';
import RianDarsonoPhoto from '@/assets/rian_darsono.jpeg';
import OliviaPhoto from '@/assets/olivia.jpg';
import MabrurPhoto from '@/assets/mabrur.jpg';

// HARDCODED STATIC STAFF LIST - NO JSON/LOCALSTORAGE
const STAFF_MEMBERS = [
  { id: 1, name: 'Risyanti Khamidah, S.Pd', role: 'Kepala Sekolah', image: null },
  { id: 2, name: 'Alwi Jamalulail, S.Pd.I', role: 'Wakasek Kurikulum', image: null },
  { id: 3, name: 'Arista Saptarini, S.Pd', role: 'Wakasek Kesiswaan', image: null },
  { id: 4, name: 'Sofia Mar\'atussholiha, S.Pd', role: 'Bahasa Indonesia', image: null },
  { id: 5, name: 'Olivia Priyandarweni, S.Pd', role: 'PKn & IPS', image: OliviaPhoto },
  { id: 6, name: 'Kiki Komalia, M.Pd', role: 'Matematika', image: null },
  { id: 7, name: 'Sidik Purnomo, M.Pd', role: 'Tahsin & Tahfidz Al-Qur\'an', image: null },
  { id: 8, name: 'Aulia Abdurrahman, S.Pd', role: 'Tahsin & Tahfidz Al-Qur\'an', image: AuliaPhoto },
  { id: 9, name: 'Hadi Jabbar hasan A, S.Pd', role: 'Pendidikan Agama Islam', image: HadiJabbarPhoto },
  { id: 10, name: 'Abu Amar, S.Pd', role: 'PJOK', image: AbuPhoto },
  { id: 11, name: 'Amerza Munandar, S.Kom', role: 'Informatika', image: AmerzaPhoto },
  { id: 12, name: 'Nurito Said, S.Pd', role: 'Seni Musik', image: null },
  { id: 13, name: 'Desi Nurlaelasari, S.Pd', role: 'IPA & Matematika', image: null },
  { id: 14, name: 'Nurkumalasari, S.Pd', role: 'Bahasa Inggris', image: null },
  { id: 15, name: 'Dian Nastiti Deserita, AP', role: 'LPK', image: null },
  { id: 16, name: 'Darsono Rian Pribadi', role: 'Kepala Tata Usaha', image: RianDarsonoPhoto },
  { id: 17, name: 'Eko Budi Sartono', role: 'Bendahara', image: EkoPhoto },
  { id: 18, name: 'M. Mabrur Riyamasey Mas\'ud, S.Kom., S.H.', role: 'Staff Tata Usaha', image: MabrurPhoto },
  { id: 19, name: 'Hadi Prawoto', role: 'Pramubakti', image: HadiPrawotoPhoto },
  { id: 20, name: 'Ahmad Furqon', role: 'Pramubakti', image: AhmadPhoto }
].map((item) => ({
  ...item,
  image: item.image || '/uploads/staff/dummy-staff.jpg',
  altText: `${item.name} - ${item.role}`
}));

const StaffPage = () => {
  const navigate = useNavigate();
  
  console.log('✅ STAFF PAGE LOADED - STATIC MODE');
  console.log('✅ Staff count:', STAFF_MEMBERS.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white pt-24 pb-20">
      <Helmet>
        <title>Guru & Karyawan | SMP Muhammadiyah 35 Jakarta</title>
        <meta name="description" content="Profil lengkap guru dan karyawan SMP Muhammadiyah 35 Jakarta. Tim pengajar profesional dan berdedikasi." />
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
            Guru & Karyawan
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Tim pengajar dan tenaga kependidikan profesional yang berdedikasi untuk memberikan pendidikan terbaik bagi siswa-siswi kami
          </p>
        </motion.div>

        {/* Staff Grid - ALWAYS SHOW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {STAFF_MEMBERS.map((staff, index) => (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-2"
            >
              <div className="aspect-square overflow-hidden bg-gradient-to-br from-[#D4E8F0] to-[#E8F4F8]">
                <img
                  src={staff.image}
                  alt={staff.altText}
                  title={staff.altText}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/uploads/staff/dummy-staff.jpg';
                  }}
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="font-poppins font-bold text-gray-800 text-lg mb-2">
                  {staff.name}
                </h3>
                <span className="inline-block px-4 py-1 bg-[#E8F4F8] text-[#5D9CEC] rounded-full text-sm font-medium">
                  {staff.role}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
