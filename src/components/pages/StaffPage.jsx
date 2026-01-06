import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';

const StaffPage = () => {
  const defaultStaff = [
    { name: "R. Agung Budi Laksono", role: "Waka Sarpras", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop" },
    { name: "Rubiyatun", role: "Waka Kesiswaan", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop" },
    { name: "Istiana", role: "Waka Kurikulum", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop" },
    { name: "Rini Yuni Astuti", role: "Waka Humas", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop" },
    { name: "Suparliyanto", role: "PLT Kasubag TU", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" },
    { name: "Sri Rahayu", role: "Guru Kimia", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop" },
    { name: "Boini", role: "Guru Matematika", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop" },
    { name: "Arief Teguh Rahardjo", role: "Guru Matematika", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop" },
    { name: "Dahrotun", role: "Guru Bahasa Indonesia", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=300&fit=crop" },
    { name: "Dwijatno Hamardianto", role: "Guru BK", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop" },
    { name: "Agus Soedarsono", role: "Guru Matematika", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop" },
    { name: "Rahayu Wuryaningsih", role: "Guru Bahasa Jawa", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop" },
  ];

  const [staffMembers, setStaffMembers] = useState(defaultStaff);
  const [usingFallback, setUsingFallback] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = db.getStaffProfiles().filter((staff) => staff.active !== false);
    if (stored.length) {
      setStaffMembers(stored.map((item, idx) => ({
        id: item.id || idx,
        name: item.name,
        role: item.position || item.role || 'Staf Sekolah',
        image: item.photo || item.image || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
        altText: `${item.name} - ${item.position || item.role || 'Staf'} SMP Muhammadiyah 35 Jakarta`
      })));
      setUsingFallback(false);
    } else {
      setStaffMembers(defaultStaff.map(s => ({
        ...s,
        altText: `${s.name} - ${s.role} SMP Muhammadiyah 35 Jakarta`
      })));
      setUsingFallback(true);
    }
  }, []);

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

        {/* Staff Grid */}
        {staffMembers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-500">
            Belum ada data guru & karyawan yang ditambahkan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {staffMembers.map((staff, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-2"
              >
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-[#D4E8F0] to-[#E8F4F8]">
                  <img 
                    src={staff.image}
                    alt={staff.altText || staff.name}
                    title={`${staff.name} - ${staff.role}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
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
        )}
      </div>
    </div>
  );
};

export default StaffPage;
