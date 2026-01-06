import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-[#E8F4F8] pt-12 md:pt-20 pb-6 md:pb-8 text-gray-700">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <img 
                src="/LOGO_BARU_SMP.png" 
                alt="Logo SMP Muhammadiyah 35 Jakarta"
                className="h-11 w-auto"
              />
              <div className="font-poppins font-bold text-lg md:text-xl text-gray-800">SMP Muhammadiyah 35</div>
            </div>
            <p className="text-xs md:text-sm leading-relaxed text-gray-600 mb-4 md:mb-6">
              Mencetak generasi berakhlak mulia, cerdas, dan berwawasan global dengan landasan nilai-nilai Islam yang kuat.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com/smpmuh35jakarta" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#5D9CEC] hover:text-white transition-all shadow-sm">
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="https://youtube.com/@smpmuh35jakarta" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#5D9CEC] hover:text-white transition-all shadow-sm">
                <Youtube className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="https://facebook.com/smpmuh35jakarta" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#5D9CEC] hover:text-white transition-all shadow-sm">
                <Facebook className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:block gap-4 md:gap-0">
            <div>
              <h3 className="font-poppins font-bold text-gray-800 mb-4 md:mb-6 text-sm md:text-base">Tautan Cepat</h3>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">
                <li><button onClick={() => scrollToSection('hero')} className="hover:text-[#5D9CEC] transition-colors">Beranda</button></li>
                <li><button onClick={() => scrollToSection('welcome')} className="hover:text-[#5D9CEC] transition-colors">Profil Sekolah</button></li>
                <li><button onClick={() => scrollToSection('programs')} className="hover:text-[#5D9CEC] transition-colors">Program Unggulan</button></li>
                <li><button onClick={() => window.location.href = '/news'} className="hover:text-[#5D9CEC] transition-colors">Berita</button></li>
                <li><button onClick={() => window.location.href = '/admin'} className="hover:text-[#5D9CEC] transition-colors">Admin Login</button></li>
              </ul>
            </div>

            {/* Programs */}
            <div className="md:mt-0">
              <h3 className="font-poppins font-bold text-gray-800 mb-4 md:mb-6 text-sm md:text-base">Program Kami</h3>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">
                <li>Tahfidz Quran</li>
                <li>International Class</li>
                <li>Student Exchange</li>
                <li>Bilingual Program</li>
                <li>Ekstrakurikuler</li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-poppins font-bold text-gray-800 mb-4 md:mb-6 text-sm md:text-base">Hubungi Kami</h3>
            <ul className="space-y-3 md:space-y-4 text-xs md:text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#5D9CEC] shrink-0" />
                <span>Jl. Panjang No.19, RT.8/RW.9, Cipulir, Kebayoran Lama, Jakarta Selatan 12230</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-[#5D9CEC] shrink-0" />
                <span>(021) 7210785</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-[#5D9CEC] shrink-0" />
                <a href="mailto:info@smpmuh35jakarta.sch.id" className="hover:text-[#5D9CEC] transition-colors">info@smpmuh35jakarta.sch.id</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-100 pt-6 md:pt-8 text-center">
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            &copy; 2026 <strong className="text-gray-800">SMP Muhammadiyah 35 Jakarta</strong> by <strong className="text-gray-800">M. Mabrur Riyamasey Mas'ud, S.Kom, S.H.</strong>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;