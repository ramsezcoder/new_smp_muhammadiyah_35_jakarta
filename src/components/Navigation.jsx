import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Instagram, Youtube, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = ({ onRegisterClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const attemptScroll = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
        return true;
      }
      return false;
    };

    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }

    if (!attemptScroll()) {
      navigate(`/#${sectionId}`);
    }
  };

  const handleMenuClick = (href) => {
    if (href.startsWith('/')) {
      navigate(href);
      setIsMobileMenuOpen(false);
      setActiveDropdown(null);
      return;
    }

    if (href.startsWith('#')) {
      const anchor = href.replace('#', '');
      if (location.pathname !== '/') {
        navigate(`/#${anchor}`);
      } else {
        scrollToSection(anchor);
      }
      setIsMobileMenuOpen(false);
      setActiveDropdown(null);
      return;
    }

    const isOnHome = location.pathname === '/';
    if (!isOnHome) {
      navigate(`/#${href}`);
    } else {
      scrollToSection(href);
    }
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };
  const menuItems = [
    { label: 'Home', href: 'hero' },
    { label: 'News', href: '/news' },
    { 
      label: 'Profile', 
      href: '#',
      dropdown: [
        { label: 'Guru & Karyawan', href: '/profile/staff' },
        { label: 'Visi & Misi', href: '/profile/vision-mission' },
        { label: 'Sejarah', href: '/profile/history' }
      ]
    },
    { 
      label: 'Gallery', 
      href: 'gallery',
      dropdown: [
        { label: 'Photo', href: '/gallery/photos' },
        { label: 'Video', href: '/gallery/videos' },
        { label: 'Infographic', href: '/gallery/infographics' }
      ]
    },
    { label: 'Facilities', href: 'facilities' },
    { 
      label: 'Online', 
      href: 'online',
      dropdown: [
        { label: 'CBT', href: 'online' },
        { label: 'PPDB', href: 'registration' },
        { label: 'E-Raport', href: 'online' },
        { label: 'LMS', href: 'online' },
        { label: 'SKL 2024', href: 'online' }
      ]
    },
    { 
      label: 'Student', 
      href: 'achievements',
      dropdown: [
        { label: 'Prestasi', href: '/student/prestasi' },
        { label: 'E-Modul', href: '/student/e-module' }
      ]
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2 md:py-3' : 'bg-white/95 backdrop-blur-md py-3 md:py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <img 
              src="/LOGO_BARU_SMP.png" 
              alt="Logo SMP Muhammadiyah 35 Jakarta"
              className="h-11 w-auto"
            />
            <div className="hidden md:block">
              <div className="font-poppins font-bold text-gray-800 text-lg leading-tight">SMP Muhammadiyah 35</div>
              <div className="text-xs text-gray-500 font-medium">Jakarta</div>
            </div>
            <div className="block md:hidden">
               <div className="font-poppins font-bold text-gray-800 text-sm leading-tight">SMP Muh 35</div>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            {menuItems.map((item, index) => (
              <div 
                key={index} 
                className="relative group"
                onMouseEnter={() => setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                    onClick={() => !item.dropdown && handleMenuClick(item.href)}
                  className="flex items-center gap-1 text-gray-600 hover:text-[#5D9CEC] font-medium transition-colors duration-200 text-sm py-2"
                >
                  {item.label}
                  {item.dropdown && <ChevronDown size={14} />}
                </button>
                
                {/* Dropdown */}
                {item.dropdown && (
                  <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white rounded-xl shadow-xl border border-blue-50 overflow-hidden">
                      {item.dropdown.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                            onClick={() => handleMenuClick(subItem.href)}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-[#E8F4F8] hover:text-[#5D9CEC] transition-colors border-b border-gray-50 last:border-0"
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Social Icons */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-[#E8F4F8] hover:text-[#5D9CEC] transition-all shadow-sm">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-[#E8F4F8] hover:text-[#5D9CEC] transition-all shadow-sm">
                <Youtube size={16} />
              </a>
            </div>

            <button
              onClick={onRegisterClick}
              className="bg-[#5D9CEC] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#4A89DC] hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm"
            >
              Daftar PPDB
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-[#5D9CEC] hover:bg-blue-50 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="container mx-auto px-4 py-3 space-y-1">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.dropdown ? (
                    <div className="py-1">
                      <div className="font-medium text-gray-800 px-4 py-2 bg-gray-50 rounded-lg mb-1 text-sm">{item.label}</div>
                      <div className="pl-4 border-l-2 border-blue-100 ml-4 space-y-1 mt-1">
                        {item.dropdown.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            onClick={() => handleMenuClick(subItem.href)}
                            className="block w-full text-left py-2 text-gray-600 hover:text-[#5D9CEC] px-2 rounded text-xs"
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMenuClick(item.href)}
                      className="block w-full text-left py-2.5 text-gray-700 hover:text-[#5D9CEC] hover:bg-[#E8F4F8] rounded-lg px-4 transition-colors font-medium text-sm"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
              
              <div className="flex gap-4 justify-center py-4 border-t border-gray-100 mt-2">
                 <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-[#E8F4F8] text-[#5D9CEC] shadow-sm"><Instagram size={20} /></a>
                 <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-[#E8F4F8] text-[#5D9CEC] shadow-sm"><Youtube size={20} /></a>
                 <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-[#E8F4F8] text-[#5D9CEC] shadow-sm"><Facebook size={20} /></a>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onRegisterClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#5D9CEC] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
                >
                  Daftar PPDB Sekarang
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;