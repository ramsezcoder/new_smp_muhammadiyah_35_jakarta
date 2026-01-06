import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';

const PAGE_SIZE = 9;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1509062522246-3755977927d7';

const SkeletonCard = () => (
  <div className="bg-white rounded-3xl border border-blue-50 shadow-sm p-4 animate-pulse">
    <div className="h-44 bg-gray-100 rounded-2xl mb-4" />
    <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
    <div className="h-4 bg-gray-100 rounded w-2/3" />
  </div>
);

const NewsCard = ({ article, onReadMore }) => {
  const image = article.featuredImage || article.image || FALLBACK_IMAGE;
  const slug = article.seo?.slug || article.slug || `article-${article.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-50 flex flex-col"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={image}
          alt={`${article.title} - Berita SMP Muhammadiyah 35 Jakarta`}
          loading="lazy"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="bg-[#E8F4F8] text-[#5D9CEC] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{article.category || 'Berita'}</span>
          <span className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" /> {article.readTime || 5} min
          </span>
        </div>
        <h3 className="font-poppins text-lg font-bold text-gray-800 leading-snug line-clamp-2">{article.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <User className="w-4 h-4 text-[#5D9CEC]" />
            {article.authorName || 'Redaksi'}
          </div>
          <button
            onClick={() => onReadMore(slug)}
            className="text-[#5D9CEC] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Read More <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const NewsListPage = ({ initialCategory = 'school', initialPage = 1, onStateChange }) => {
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [page, setPage] = useState(initialPage);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateUrl = (cat, pageNum) => {
    const url = new URL(window.location.href);
    url.searchParams.set('category', cat);
    url.searchParams.set('page', pageNum);
    window.history.replaceState({}, '', `${url.pathname}?${url.searchParams.toString()}`);
    if (onStateChange) onStateChange(cat, pageNum);
  };

  useEffect(() => {
    setActiveTab(initialCategory);
    setPage(initialPage);
  }, [initialCategory, initialPage]);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/news/list?category=${activeTab}&page=${page}&limit=${PAGE_SIZE}`);
        if (!response.ok) throw new Error('Failed to fetch news');
        const data = await response.json();
        if (isCancelled) return;
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        if (isCancelled) return;
        setError('Gagal memuat berita, menampilkan data lokal.');
        const all = db.getNews().filter(
          n => n.status === 'published' && (!n.channel || n.channel === activeTab)
        );
        const start = (page - 1) * PAGE_SIZE;
        setItems(all.slice(start, start + PAGE_SIZE));
        setTotalPages(Math.max(1, Math.ceil(all.length / PAGE_SIZE)));
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchData();
    updateUrl(activeTab, page);

    return () => { isCancelled = true; };
  }, [activeTab, page]);

  const handleTabChange = (cat) => {
    if (cat === activeTab) return;
    setActiveTab(cat);
    setPage(1);
  };

  const handleReadMore = (slug) => {
    window.location.href = `/news/${slug}`;
  };

  const paginationText = useMemo(() => `Page ${page} of ${totalPages}`, [page, totalPages]);

  const showPrev = page > 1;
  const showNext = page < totalPages;

  return (
    <section className="pt-28 pb-16 bg-[#FAFDFF] min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <h1 className="font-poppins text-3xl md:text-4xl font-bold text-gray-800 mb-2">Kanal Berita</h1>
            <p className="text-gray-500 text-sm md:text-base">Update terkini kegiatan SMP Muhammadiyah 35 Jakarta</p>
          </div>
          <div className="bg-white p-1 rounded-full border border-blue-100 shadow-sm inline-flex self-start md:self-auto mt-4 md:mt-0">
            <button
              onClick={() => handleTabChange('school')}
              className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'school' ? 'bg-[#5D9CEC] text-white shadow-md' : 'text-gray-500 hover:text-[#5D9CEC]'
              }`}
            >
              News Sekolah
            </button>
            <button
              onClick={() => handleTabChange('student')}
              className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'student' ? 'bg-[#5D9CEC] text-white shadow-md' : 'text-gray-500 hover:text-[#5D9CEC]'
              }`}
            >
              News Siswa
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
          ) : items.length > 0 ? (
            <AnimatePresence>
              {items.map((article) => (
                <NewsCard key={article.id} article={article} onReadMore={handleReadMore} />
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-400">Tidak ada berita untuk kategori ini.</div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mt-10 text-sm text-gray-600">
          <button
            disabled={!showPrev}
            onClick={() => showPrev && setPage(page - 1)}
            className={`px-4 py-2 rounded-full border ${showPrev ? 'border-gray-200 hover:border-[#5D9CEC] hover:text-[#5D9CEC]' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}
          >
            Prev
          </button>
          <span className="text-gray-500">{paginationText}</span>
          <button
            disabled={!showNext}
            onClick={() => showNext && setPage(page + 1)}
            className={`px-4 py-2 rounded-full border ${showNext ? 'border-gray-200 hover:border-[#5D9CEC] hover:text-[#5D9CEC]' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsListPage;
