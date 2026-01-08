import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, ArrowRight } from 'lucide-react';
import { fetchNewsWithFallback } from '@/lib/fetchWithFallback';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1509062522246-3755977927d7';

const NewsSection = () => {
  const [activeTab, setActiveTab] = useState('school'); // 'school' or 'student'
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let isMounted = true;
    fetchNewsWithFallback(activeTab, { limit: 4, page: 1 })
      .then(({ items }) => {
        if (isMounted) setArticles(items.slice(0, 4));
      })
      .catch(() => {
        if (isMounted) setArticles([]);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const handleReadMore = (article) => {
    const slug = article.seo?.slug || article.slug || `article-${article.id}`;
    window.location.href = `/news/${slug}`;
  };

  return (
    <section id="news" className="py-12 md:py-24 bg-[#FAFDFF]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="font-poppins text-2xl md:text-4xl font-bold text-gray-800 mb-2">
              Kanal Berita
            </h2>
            <p className="text-gray-500 text-sm md:text-lg">Update terkini kegiatan SMP Muhammadiyah 35 Jakarta</p>
          </div>
          
          <div className="bg-white p-1 rounded-full border border-blue-100 shadow-sm inline-flex self-start md:self-auto w-full md:w-auto">
            <button
              onClick={() => setActiveTab('school')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'school' 
                  ? 'bg-[#5D9CEC] text-white shadow-md' 
                  : 'text-gray-500 hover:text-[#5D9CEC]'
              }`}
            >
              News Sekolah
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'student' 
                  ? 'bg-[#5D9CEC] text-white shadow-md' 
                  : 'text-gray-500 hover:text-[#5D9CEC]'
              }`}
            >
              News Siswa
            </button>
          </div>
        </div>

        {/* Desktop Grid / Mobile Carousel */}
        <div className="flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 md:grid md:grid-cols-2 md:gap-8 md:pb-0 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {articles.length > 0 ? articles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="min-w-[300px] md:min-w-0 snap-center bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-blue-50"
              >
                <div className="flex flex-col md:flex-row h-full">
                  <div className="md:w-2/5">
                    <div className="relative h-48 md:h-full overflow-hidden bg-gray-100">
                      <img 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        alt={`${article.title} - Berita SMP Muhammadiyah 35 Jakarta`}
                        src={article.featuredImage || FALLBACK_IMAGE}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                  <div className="p-5 md:p-8 md:w-3/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <span className="bg-[#E8F4F8] text-[#5D9CEC] text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1 rounded-full uppercase tracking-wider">
                          {article.category}
                        </span>
                        <div className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {article.readTime || 5} min
                        </div>
                      </div>
                      
                      <h3 className="font-poppins text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3 leading-snug group-hover:text-[#5D9CEC] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-gray-500 text-xs md:text-sm mb-4 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 font-medium">
                        <User className="w-3 h-3 md:w-4 md:h-4 text-[#5D9CEC]" />
                        {article.authorName}
                      </div>
                      
                      <button 
                        onClick={() => handleReadMore(article)}
                        className="text-[#5D9CEC] text-xs md:text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all"
                      >
                        Read More <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
                <div className="col-span-2 text-center py-12 text-gray-400">
                    No articles found for this category.
                </div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="text-center mt-6 md:mt-10">
          <button 
            onClick={() => window.location.href = '/news'}
            className="text-gray-500 hover:text-[#5D9CEC] font-medium text-xs md:text-sm border-b border-gray-300 hover:border-[#5D9CEC] pb-1 transition-all"
          >
            Lihat Semua Berita
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;