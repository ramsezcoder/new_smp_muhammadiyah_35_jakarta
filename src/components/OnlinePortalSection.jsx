import React from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Laptop, ClipboardList, UserCheck, BookOpen, GraduationCap, FileText } from 'lucide-react';

const OnlinePortalSection = () => {
  const { toast } = useToast();

  const portals = [
    { name: 'LMS', icon: Laptop, color: 'bg-blue-500' },
    { name: 'PPDB', icon: ClipboardList, color: 'bg-green-500' },
    { name: 'Student Login', icon: UserCheck, color: 'bg-purple-500' },
    { name: 'E-Raport', icon: BookOpen, color: 'bg-orange-500' },
    { name: 'CBT', icon: FileText, color: 'bg-red-500' },
    { name: 'SKL', icon: GraduationCap, color: 'bg-teal-500' },
  ];

  const handleAccess = (name) => {
    toast({
      title: "Akses Portal",
      description: `Mengalihkan ke sistem ${name}... (Demo)`,
    });
  };

  return (
    <section id="online" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="font-poppins text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-4">
            Portal Digital Terintegrasi
          </h2>
          <p className="text-gray-500 text-sm md:text-base">Akses cepat ke berbagai layanan sistem informasi sekolah</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {portals.map((portal, index) => {
            const Icon = portal.icon;
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAccess(portal.name)}
                className="flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl bg-[#FAFDFF] border border-blue-50 shadow-sm hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-2 md:mb-3 text-white shadow-md ${portal.color} group-hover:shadow-lg transition-all`}>
                  <Icon className="w-5 h-5 md:w-7 md:h-7" />
                </div>
                <span className="font-bold text-gray-700 text-xs md:text-sm">{portal.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OnlinePortalSection;