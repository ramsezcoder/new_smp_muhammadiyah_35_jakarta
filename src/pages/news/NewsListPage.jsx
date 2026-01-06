import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, User, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/db';
import { SITE_INFO } from '@/lib/seo-utils';
import { getCategoryParam, getIntParam } from '@/utils/query';
import { fetchNewsWithFallback } from '@/lib/fetchWithFallback';
import { MESSAGES } from '@/config/staticMode';

const PAGE_SIZE = 9;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1509062522246-3755977927d7';

const SkeletonCard = () => (
  <div className="bg-white rounded-3xl border border-blue-50 shadow-sm p-4 animate-pulse">
    <div className="h-48 bg-gray-100 rounded-2xl mb-4" />
    <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
    <div className="h-4 bg-gray-100 rounded w-2/3" />
  </div>
);

const NewsCard = React.forwardRef(({ article, onReadMore }, ref) => {
  const image = article.featuredImage || FALLBACK_IMAGE;
  const slug = article.seo?.slug || article.slug || `article-${article.id}`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-50 flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={`${article.title} - Berita SMP Muhammadiyah 35 Jakarta`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="bg-[#E8F4F8] text-[#5D9CEC] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {article.category || 'Berita'}
          </span>
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
});

const NewsListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(() => getCategoryParam(searchParams, ['school', 'student'], 'school'));
  const [page, setPage] = useState(() => getIntParam(searchParams, 'page', 1));
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchTimer = useRef(null);

  const canonicalUrl = `${SITE_INFO.url}news?category=${category}&page=${page}`;
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_INFO.url },
      { '@type': 'ListItem', position: 2, name: 'Kanal Berita', item: `${SITE_INFO.url}news` }
    ]
  };

  const handleReadMore = (slug) => {
    console.log('news_viewed', slug);
    navigate(`/news/${slug}`);
  };

  const updateSearchParams = (cat, currentPage) => {
    setSearchParams({ category: cat, page: String(currentPage) });
  };

  const fetchNews = async (cat, currentPage) => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from API first
      const allNews = await fetchNewsWithFallback(cat, 3000);
      
      // If we got data from fallback, show the message
      if (allNews.length > 0) {
        const start = (currentPage - 1) * PAGE_SIZE;
        const paged = allNews.slice(start, start + PAGE_SIZE);
        setItems(paged);
        setTotalPages(Math.max(1, Math.ceil(allNews.length / PAGE_SIZE)));
        setPage(currentPage);
        
        // Check if this is fallback data by trying API first
        try {
          await fetch(`/api/news/list?category=${cat}`, { signal: AbortSignal.timeout(2000) });
        } catch {
          setError(MESSAGES.FALLBACK_NEWS);
        }
      } else {
        throw new Error('No news available');
      }
    } catch (err) {
      console.warn('[news] fetch failed:', err);
      setError(MESSAGES.FALLBACK_NEWS);
      
      // Fallback to db.getNews()
      const all = db.getNews().filter(
        (n) => n.status === 'published' && (!n.channel || n.channel === cat)
      );
      const start = (currentPage - 1) * PAGE_SIZE;
      setItems(all.slice(start, start + PAGE_SIZE));
      setTotalPages(Math.max(1, Math.ceil(all.length / PAGE_SIZE)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(() => {
      fetchNews(category, page).then(() => {
        updateSearchParams(category, page);
      });
    }, 120);

    return () => fetchTimer.current && clearTimeout(fetchTimer.current);
  }, [category, page]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [category, page]);

  useEffect(() => {
    if (error) {
      toast({ title: 'Gagal memuat berita', description: error, variant: 'destructive' });
    }
  }, [error, toast]);

  const handleTabChange = (cat) => {
    if (cat === category) return;
    setCategory(cat);
    setPage(1);
  };

  const paginationText = useMemo(() => `Page ${page} of ${totalPages}`, [page, totalPages]);
  const showPrev = page > 1;
  const showNext = page < totalPages;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white pt-28 pb-16">
      <Helmet>
        <html lang="id" />
        <title>Kanal Berita | SMP Muhammadiyah 35 Jakarta</title>
        <meta
          name="description"
          content="Kanal berita resmi SMP Muhammadiyah 35 Jakarta. Update terkini kegiatan sekolah dan siswa."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mb-10">
          <div className="bg-white border border-blue-100 shadow-[0_20px_60px_-25px_rgba(93,156,236,0.35)] rounded-3xl p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-[#5D9CEC] text-sm font-medium mb-4"
                >
                  <ArrowLeft size={18} />
                  <span>← Kembali ke Beranda</span>
                </button>
                <h1 className="font-poppins text-3xl md:text-5xl font-bold text-gray-800 mb-2">Kanal Berita</h1>
                <p className="text-gray-600 text-sm md:text-lg">
                  Update terkini kegiatan SMP Muhammadiyah 35 Jakarta
                </p>
              </div>
              <div className="bg-[#F5FAFF] p-1 rounded-full border border-blue-100 shadow-sm inline-flex w-fit">
                <button
                  onClick={() => handleTabChange('school')}
                  className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                    category === 'school' ? 'bg-[#5D9CEC] text-white shadow-md' : 'text-gray-600 hover:text-[#5D9CEC]'
                  }`}
                >
                  News Sekolah
                </button>
                <button
                  onClick={() => handleTabChange('student')}
                  className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                    category === 'student' ? 'bg-[#5D9CEC] text-white shadow-md' : 'text-gray-600 hover:text-[#5D9CEC]'
                  }`}
                >
                  News Siswa
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {loading ? (
            Array.from({ length: 9 }).map((_, idx) => <SkeletonCard key={idx} />)
          ) : items.length > 0 ? (
            items.map((article) => (
              <NewsCard key={article.id} article={article} onReadMore={handleReadMore} />
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-400">Tidak ada berita untuk kategori ini.</div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mt-10 text-sm text-gray-600">
          <button
            disabled={!showPrev}
            onClick={() => showPrev && setPage(page - 1)}
            className={`px-4 py-2 rounded-full border ${
              showPrev ? 'border-gray-200 hover:border-[#5D9CEC] hover:text-[#5D9CEC]' : 'border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            Prev
          </button>
          <span className="text-gray-500">{paginationText}</span>
          <button
            disabled={!showNext}
            onClick={() => showNext && setPage(page + 1)}
            className={`px-4 py-2 rounded-full border ${
              showNext ? 'border-gray-200 hover:border-[#5D9CEC] hover:text-[#5D9CEC]' : 'border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsListPage;
