import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, User, ArrowLeft, Facebook, Twitter, Link as LinkIcon, 
  Instagram, Send, MessageCircle 
} from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { SITE_INFO, generateTitle, getArticleSchema, getBreadcrumbSchema, getShareUrls } from '@/lib/seo-utils';

const ArticleDetail = ({ articleId, onBack }) => {
  const { toast } = useToast();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    // In a real app, we would fetch by slug or ID
    const news = db.getNews();
    const found = news.find(n => n.id === articleId) || news[0]; // Fallback to first for demo
    setArticle(found);
    window.scrollTo(0, 0);
  }, [articleId]);

  if (!article) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const articleSlug = article.seo?.slug || article.slug || `article-${articleId}`;
  const articleUrl = `${SITE_INFO.url}article/${articleSlug}`;
  const shareUrls = getShareUrls(articleUrl, article.title);
  const articleImage = article.featuredImage || SITE_INFO.image;
  const seoTitle = article.seo?.seoTitle || article.title;
  const metaDescription = article.seo?.metaDescription || article.excerpt || article.title;
  const keywordSuggestions = Array.isArray(article.seo?.keywordSuggestions) ? article.seo.keywordSuggestions : [];

  // Generate SEO keywords from tags and hashtags
  const seoKeywords = Array.from(new Set([
    ...(article.tags ? article.tags.split(',').map(t => t.trim()) : []),
    ...(Array.isArray(article.hashtags) ? article.hashtags.map(h => h.replace('#', '')) : []),
    ...keywordSuggestions,
    'SMP Muhammadiyah 35 Jakarta',
    'Berita Sekolah'
  ].filter(Boolean))).slice(0, 10).join(', ');
  
  const articleSchemaData = getArticleSchema({
    title: seoTitle,
    description: metaDescription,
    image: articleImage,
    publishDate: article.publishedAt || article.createdAt,
    modifiedDate: article.updatedAt || article.publishedAt || article.createdAt,
    author: article.authorName,
    authorRole: article.authorRole,
    url: articleUrl
  });

  const handleShare = (platform) => {
    const url = articleUrl;
    const text = `Check out this article: ${article.title}`;
    
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

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      {/* SEO Meta Tags */}
      <Helmet>
        <html lang="id" />
        <title>{generateTitle(seoTitle)}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={seoKeywords} />
        <link rel="canonical" href={articleUrl} />
        
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
        
        {/* Article Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(articleSchemaData)}
        </script>
        
        {/* Breadcrumb Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbSchema([
            { name: 'Home', url: SITE_INFO.url },
            { name: 'Berita', url: `${SITE_INFO.url}#news` },
            { name: article.title, url: articleUrl }
          ]))}
        </script>
      </Helmet>

      {/* Breadcrumb & Back */}
      <div className="container mx-auto px-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-gray-500 hover:text-[#5D9CEC]">
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
              {article.readTime} min read
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
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {article.tags?.split(',').map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-[#E8F4F8] hover:text-[#5D9CEC] cursor-pointer transition-colors">
                #{tag.trim()}
              </span>
            ))}
          </div>
        </div>

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