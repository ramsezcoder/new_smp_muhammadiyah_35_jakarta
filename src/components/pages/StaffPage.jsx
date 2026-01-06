import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';

const StaffPage = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/staff');
        const json = await res.json();
        const stored = (json.items || []).filter((s) => s.active !== false);
        if (stored.length) {
          setStaffMembers(stored.map((item, idx) => ({
            id: item.id || idx,
            name: item.name,
            role: item.position || item.role || 'Staf Sekolah',
            image: item.photoUrl || item.photo || item.image || '',
            altText: `${item.name} - ${item.position || item.role || 'Staf'} SMP Muhammadiyah 35 Jakarta`
          })));
        } else {
          setStaffMembers([]);
        }
      } catch (e) {
        console.warn('[StaffPage] API load failed:', e.message);
        setStaffMembers([]);
      }
    };
    load();
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
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <p className="text-gray-600 text-lg mb-2">Belum ada data guru & karyawan yang ditambahkan.</p>
            <p className="text-gray-400 text-sm">Admin dapat mengelola data staff dari dashboard.</p>
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
