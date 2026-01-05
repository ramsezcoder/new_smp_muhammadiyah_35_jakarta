import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Trophy, Award, Star, Building2, Users } from 'lucide-react';

const CounterAnimation = ({ end, duration = 2000, suffix = '', inView }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(end * percentage));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure it ends exactly on the number
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, inView]);

  return <span>{count}{suffix}</span>;
};

const AchievementsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const achievements = [
    {
      icon: Trophy,
      value: 7,
      label: 'Prestasi Sekolah',
      sublabel: 'Terbaik'
    },
    {
      icon: Award,
      value: 'A',
      label: 'Akreditasi',
      sublabel: 'Sekolah',
      isLetter: true
    },
    {
      icon: Star,
      value: 7,
      label: 'Medali Emas',
      sublabel: 'Prestasi Siswa'
    },
    {
      icon: Building2,
      value: 9,
      label: 'Fasilitas',
      sublabel: 'Lengkap'
    },
    {
      icon: Users,
      value: 210,
      label: 'Siswa',
      sublabel: 'Tahun 2024/2025'
    }
  ];

  return (
    <section id="achievements" className="py-12 md:py-24 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="font-poppins text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">
            Pencapaian <span className="text-[#5D9CEC]">SMP Muhammadiyah 35</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-lg">
            Bukti nyata komitmen kami dalam memberikan pendidikan terbaik
          </p>
        </motion.div>

        {/* Desktop Grid / Mobile Carousel */}
        <div className="flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-8 md:pb-0 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-hide justify-start md:justify-center">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="min-w-[160px] snap-center text-center group bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#E8F4F8] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#5D9CEC] transition-colors duration-300">
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-[#5D9CEC] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-3xl md:text-5xl font-bold text-gray-800 mb-1 md:mb-2 font-poppins">
                  {achievement.isLetter ? (
                    achievement.value
                  ) : (
                    <CounterAnimation end={achievement.value} inView={inView} />
                  )}
                </div>
                <div className="text-gray-800 font-bold text-xs md:text-sm uppercase tracking-wide">
                  {achievement.label}
                </div>
                <div className="text-gray-500 text-[10px] md:text-xs">
                  {achievement.sublabel}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;