import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const QuoteSection = () => {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-r from-[#5D9CEC] to-[#4A89DC] text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Quote className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-4 md:mb-6 text-white/50" />
          <p className="font-poppins text-lg md:text-3xl lg:text-4xl font-light leading-relaxed italic mb-6 md:mb-8">
            "SMP Muhammadiyah 35 Jakarta mencetak generasi berakhlak Islami dan berprestasi melalui pendidikan berkualitas dan program unggulan yang seimbang antara ilmu dan nilai keislaman."
          </p>
          <div className="w-12 md:w-16 h-1 bg-white/50 mx-auto rounded-full"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default QuoteSection;