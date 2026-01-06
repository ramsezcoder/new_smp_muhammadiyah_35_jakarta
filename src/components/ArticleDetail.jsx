import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, Clock, User, ArrowLeft, Facebook, Twitter, Link as LinkIcon, 
  Instagram, Send, MessageCircle 
} from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { SITE_INFO, getBreadcrumbSchema, getOrganizationSchema, getShareUrls } from '@/lib/seo-utils';

const ArticleDetail = ({ articleId, slugParam, onBack }) => {
  const { toast } = useToast();
  const params = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolvedSlug = slugParam || params?.slug;
  const resolvedId = articleId || (params?.id ? parseInt(params.id, 10) : null);

  useEffect(() => {
    let isMounted = true;

    const fallbackFromDb = () => {
      const news = db.getNews();
      let found = null;

      if (resolvedId) {
        found = news.find((n) => n.id === resolvedId);
      }

      if (!found && resolvedSlug) {
        found = news.find((n) => (n.seo?.slug || n.slug) === resolvedSlug) || news.find((n) => String(n.id) === resolvedSlug);
      }

      return found || news[0] || null;
    };

    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        let record = null;

        if (!resolvedId && resolvedSlug) {
          const res = await fetch(`/api/news/detail/${resolvedSlug}`);
          if (!res.ok) throw new Error('Failed to fetch news detail');
          const payload = await res.json();
          record = payload.record || payload.data || payload.article || payload.post || null;
        }

        if (!record) {
          record = fallbackFromDb();
        }

        if (!record) throw new Error('Article not found');

        if (isMounted) {
          setArticle(record);
          console.log('news_viewed', record.slug || resolvedSlug || record.id);
        }
      } catch (err) {
        console.warn('[news] detail fetch failed', err);
        const fallback = fallbackFromDb();
        if (isMounted) {
          setError('Gagal memuat artikel, menampilkan konten lokal.');
          setArticle(fallback);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [resolvedId, resolvedSlug]);

  useEffect(() => {
    if (error) {
      toast({ title: 'Gagal memuat artikel', description: error, variant: 'destructive' });
    }
  }, [error, toast]);

  const baseSlug = article?.seo?.slug || article?.slug || resolvedSlug || `article-${articleId || article?.id || 'detail'}`;
  const articleUrl = `${SITE_INFO.url}news/${baseSlug}`;
  const shareUrls = getShareUrls(articleUrl, article?.title || 'Berita SMP Muhammadiyah 35 Jakarta');
  const articleImage = article?.featuredImage || SITE_INFO.image;
  const computedTitle = article ? `${article.title} | SMP Muhammadiyah 35 Jakarta` : 'Berita | SMP Muhammadiyah 35 Jakarta';
  const seoTitle = computedTitle;
  const plainText = (article?.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const rawDescription = article?.seo?.metaDescription || article?.excerpt || plainText || article?.title || 'Berita SMP Muhammadiyah 35 Jakarta';
  const metaDescription = rawDescription.slice(0, 160);
  const keywordSuggestions = Array.isArray(article?.seo?.keywordSuggestions) ? article.seo.keywordSuggestions : [];

  const seoKeywords = Array.from(new Set([
    ...(article?.tags && typeof article.tags === 'string' ? article.tags.split(',').map((t) => t.trim()) : []),
    ...(Array.isArray(article?.hashtags) ? article.hashtags.map((h) => h.replace('#', '')) : []),
    ...keywordSuggestions,
    'SMP Muhammadiyah 35 Jakarta',
    'Berita Sekolah'
  ].filter(Boolean))).slice(0, 10).join(', ');

  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: 'Home', url: SITE_INFO.url },
    { name: 'Berita', url: `${SITE_INFO.url}news` },
    { name: article?.title || 'Detail Berita', url: articleUrl }
  ]);

  const newsJsonLd = article ? {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: metaDescription,
    image: [articleImage],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    author: { '@type': 'Organization', name: 'SMP Muhammadiyah 35 Jakarta', url: SITE_INFO.url },
    publisher: {
      '@type': 'Organization',
      name: 'SMP Muhammadiyah 35 Jakarta',
      logo: { '@type': 'ImageObject', url: SITE_INFO.image }
    },
    mainEntityOfPage: articleUrl,
    url: articleUrl
  } : null;

  if (loading || !article) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20">
        <Helmet>
          <html lang="id" />
          <title>{computedTitle}</title>
          <meta name="description" content={metaDescription} />
          <link rel="canonical" href={articleUrl} />
        </Helmet>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-32 bg-gray-100 rounded" />
            <div className="h-12 w-2/3 bg-gray-100 rounded" />
            <div className="h-64 bg-gray-100 rounded-3xl" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded" />
              <div className="h-4 bg-gray-100 rounded" />
              <div className="h-4 w-5/6 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleShare = (platform) => {
    const url = articleUrl;
    
    let shareUrl = '';
    switch(platform) {
      case 'facebook': shareUrl = shareUrls.facebook; break;
      case 'twitter': shareUrl = shareUrls.twitter; break;
      case 'whatsapp': shareUrl = shareUrls.whatsapp; break;
      case 'telegram': shareUrl = shareUrls.telegram; break;
      case 'copy': 
        navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: "Article URL copied to clipboard" });
        return;
      case 'instagram':
        window.open(SITE_INFO.socialMedia.instagram, '_blank');
        return;
      default: return;
    }
    
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  const ShareButton = ({ icon: Icon, label, platform, color }) => (
    <button
      onClick={() => handleShare(platform)}
      className="group relative flex items-center justify-center w-12 h-12 bg-[#E8F4F8] hover:bg-[#5D9CEC] rounded-full text-[#5D9CEC] hover:text-white transition-all shadow-sm hover:shadow-md hover:scale-110"
      title={label}
    >
      <Icon size={20} />
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </span>
    </button>
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate('/news');
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      {/* SEO Meta Tags */}
      <Helmet>
        <html lang="id" />
        <title>{computedTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={seoKeywords} />
        <link rel="canonical" href={articleUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={articleImage} />
        <meta property="article:published_time" content={article.publishedAt || article.createdAt} />
        <meta property="article:modified_time" content={article.updatedAt || article.publishedAt || article.createdAt} />
        <meta property="article:author" content={article.authorName} />
        <meta property="article:tag" content={article.tags} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={articleImage} />
        
        {newsJsonLd && (
          <script type="application/ld+json">
            {JSON.stringify(newsJsonLd)}
          </script>
        )}
        <script type="application/ld+json">{JSON.stringify(getOrganizationSchema())}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* Breadcrumb & Back */}
      <div className="container mx-auto px-4 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <button className="hover:text-[#5D9CEC]" onClick={() => navigate('/')}>Home</button>
          <span className="text-gray-400">›</span>
          <button className="hover:text-[#5D9CEC]" onClick={() => navigate('/news')}>Kanal Berita</button>
          <span className="text-gray-400">›</span>
          <span className="text-gray-700 line-clamp-1 max-w-xs md:max-w-sm">{article.title}</span>
        </div>
        <Button variant="ghost" onClick={handleBack} className="gap-2 text-gray-500 hover:text-[#5D9CEC]">
          <ArrowLeft size={18} /> Back to News
        </Button>
      </div>

      <article className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-[#E8F4F8] text-[#5D9CEC] rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            {article.category}
          </span>
          <h1 className="font-poppins text-3xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                {article.authorName?.charAt(0)}
              </div>
              <span className="font-medium text-gray-700">{article.authorName}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              {article.readTime || 5} min read
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="rounded-3xl overflow-hidden shadow-xl mb-12 border border-gray-100 aspect-video">
          <img 
            src={articleImage} 
            alt={`${article.title} - SMP Muhammadiyah 35 Jakarta`}
            loading="eager"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:font-poppins prose-a:text-[#5D9CEC] text-gray-700 leading-relaxed font-roboto"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && typeof article.tags === 'string' && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {article.tags.split(',').map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-[#E8F4F8] hover:text-[#5D9CEC] cursor-pointer transition-colors">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

          {/* Hashtags */}
          {article.hashtags && article.hashtags.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {article.hashtags.map((hashtag, i) => (
                  <span key={i} className="px-3 py-1 bg-[#E8F4F8] text-[#5D9CEC] rounded-full text-sm font-medium">
                    {hashtag}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Share Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <h3 className="font-poppins font-bold text-gray-800 mb-6 tracking-widest text-sm uppercase">Bagikan Artikel Ini</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <ShareButton icon={Facebook} label="Facebook" platform="facebook" />
            <ShareButton icon={Twitter} label="X / Twitter" platform="twitter" />
            <ShareButton icon={MessageCircle} label="WhatsApp" platform="whatsapp" />
            <ShareButton icon={Send} label="Telegram" platform="telegram" />
            <ShareButton icon={LinkIcon} label="Copy Link" platform="copy" />
            <ShareButton icon={Instagram} label="Instagram" platform="instagram" />
          </div>
        </div>

        {/* Author Box */}
        <div className="mt-12 bg-[#FAFDFF] rounded-2xl p-8 border border-blue-50 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center text-2xl font-bold text-[#5D9CEC] border-2 border-[#E8F4F8] shrink-0">
             {article.authorName?.charAt(0)}
          </div>
          <div>
            <h4 className="font-poppins font-bold text-lg text-gray-800 mb-1">{article.authorName}</h4>
            <p className="text-[#5D9CEC] text-xs font-bold uppercase tracking-wide mb-3">{article.authorRole}</p>
            <p className="text-gray-600 text-sm">
              Staff pengajar dan tim redaksi SMP Muhammadiyah 35 Jakarta. Berdedikasi untuk memberikan informasi terkini seputar kegiatan sekolah dan prestasi siswa.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticleDetail;