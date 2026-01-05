import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import WelcomeSection from '@/components/WelcomeSection';
import PricingSection from '@/components/PricingSection';
import FlyerSection from '@/components/FlyerSection';
import ProgramsSection from '@/components/ProgramsSection';
import QuoteSection from '@/components/QuoteSection';
import AchievementsSection from '@/components/AchievementsSection';
import NewsSection from '@/components/NewsSection';
import GallerySection from '@/components/GallerySection';
import FacilitiesSection from '@/components/FacilitiesSection';
import OnlinePortalSection from '@/components/OnlinePortalSection';
import RegistrationSection from '@/components/RegistrationSection';
import GoogleMapSection from '@/components/GoogleMapSection';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import AdminDashboard from '@/components/AdminDashboard';
import ArticleDetail from '@/components/ArticleDetail';
import StaffPage from '@/components/pages/StaffPage';
import VisionMissionPage from '@/components/pages/VisionMissionPage';
import HistoryPage from '@/components/pages/HistoryPage';
import PhotoGallery from '@/components/pages/PhotoGallery';
import VideoGallery from '@/components/pages/VideoGallery';
import InfographicGallery from '@/components/pages/InfographicGallery';
import EModulePage from '@/components/pages/EModulePage';
import PrestasiPage from '@/components/pages/PrestasiPage';
import { SITE_INFO, SEO_KEYWORDS, generateTitle, generateDescription, getOrganizationSchema, getLocalBusinessSchema, getBreadcrumbSchema } from '@/lib/seo-utils';
import { db } from '@/lib/db';

function App() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  // View state: 'home', 'admin', 'article-detail', 'staff', 'vision-mission', 'history', 'photo-gallery', 'video-gallery', 'infographic-gallery', 'e-module', 'prestasi'
  const [currentView, setCurrentView] = useState('home'); 
  const [selectedArticleId, setSelectedArticleId] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      const { hash, pathname } = window.location;
      const news = db.getNews();

      if (pathname.startsWith('/preview/article/')) {
        const id = parseInt(pathname.replace('/preview/article/', ''));
        if (id) {
          setSelectedArticleId(id);
          setCurrentView('article-detail');
          return;
        }
      }

      if (pathname.startsWith('/article/')) {
        const slug = pathname.replace('/article/', '').replace(/\/$/, '');
        const found = news.find(n => (n.seo?.slug || n.slug) === slug);
        if (found) {
          setSelectedArticleId(found.id);
          setCurrentView('article-detail');
          return;
        }
      }

      if (hash === '#admin') {
        setCurrentView('admin');
      } else if (hash.startsWith('#article-')) {
        const id = parseInt(hash.replace('#article-', ''));
        setSelectedArticleId(id);
        setCurrentView('article-detail');
      } else if (hash === '#profile/staff') {
        setCurrentView('staff');
      } else if (hash === '#profile/vision-mission') {
        setCurrentView('vision-mission');
      } else if (hash === '#profile/history') {
        setCurrentView('history');
      } else if (hash === '#gallery/photos') {
        setCurrentView('photo-gallery');
      } else if (hash === '#gallery/videos') {
        setCurrentView('video-gallery');
      } else if (hash === '#gallery/infographics') {
        setCurrentView('infographic-gallery');
      } else if (hash === '#student/e-module') {
        setCurrentView('e-module');
      } else if (hash === '#student/prestasi') {
        setCurrentView('prestasi');
      } else {
        setCurrentView('home');
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const scrollToRegistration = () => {
    if (currentView !== 'home') {
        window.location.hash = '';
        setTimeout(() => {
            const element = document.getElementById('registration');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        const element = document.getElementById('registration');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- VIEWS ---

  if (currentView === 'staff') {
    return (
      <>
        <Navigation />
        <StaffPage />
        <Footer />
        <Toaster />
      </>
    );
  }

  if (currentView === 'vision-mission') {
    return (
      <>
        <Navigation />
        <VisionMissionPage />
        <Footer />
        <Toaster />
      </>
    );
  }

  if (currentView === 'history') {
    return (
      <>
        <Navigation />
        <HistoryPage />
        <Footer />
        <Toaster />
      </>
    );
  }

  if (currentView === 'photo-gallery') {
    return (
      <>
        <Navigation />
        <PhotoGallery />
        <Footer />
        <Toaster />
      </>
    );
  }

  if (currentView === 'video-gallery') {
    return (
      <>
        <Navigation />
        <VideoGallery />
        <Footer />
        <Toaster />
      </>
    );
  }

  if (currentView === 'infographic-gallery') {
    return (
      <>
        <Navigation />
        <InfographicGallery />
        <Footer />
        <Toaster />
      </>
    );
  }

  if (currentView === 'e-module') {
    return (
      <>
        <Navigation />
        <EModulePage />
        <Footer />
        <Toaster />
      </>
    );
  }

  if (currentView === 'prestasi') {
    return (
      <>
        <Navigation />
        <PrestasiPage />
        <Footer />
        <Toaster />
      </>
    );
  }

  if (currentView === 'admin') {
    return (
      <>
        <Helmet>
          <html lang="id" />
          <title>{generateTitle('Admin Dashboard')}</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <AdminDashboard onLogout={() => window.location.hash = ''} />
        <Toaster />
      </>
    );
  }

  if (currentView === 'article-detail' && selectedArticleId) {
    return (
      <>
        <Helmet>
          <html lang="id" />
          <title>{generateTitle('Berita')}</title>
          <meta name="description" content="Baca berita terbaru dari SMP Muhammadiyah 35 Jakarta. Informasi kegiatan sekolah, prestasi siswa, dan update PPDB terkini." />
          <link rel="canonical" href={`${SITE_INFO.url}#article-${selectedArticleId}`} />
          
          {/* Open Graph */}
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`${SITE_INFO.url}#article-${selectedArticleId}`} />
          <meta property="og:title" content={generateTitle('Berita')} />
          <meta property="og:image" content={SITE_INFO.image} />
          
          {/* Breadcrumb */}
          <script type="application/ld+json">
            {JSON.stringify(getBreadcrumbSchema([
              { name: 'Home', url: SITE_INFO.url },
              { name: 'Berita', url: `${SITE_INFO.url}#news` },
              { name: 'Detail Berita', url: `${SITE_INFO.url}#article-${selectedArticleId}` }
            ]))}
          </script>
        </Helmet>
        <Navigation onRegisterClick={scrollToRegistration} />
        <ArticleDetail 
            articleId={selectedArticleId} 
            onBack={() => window.history.back()} 
        />
        <Footer />
        <Toaster />
      </>
    );
  }

  // Home View
  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <html lang="id" />
        <title>{generateTitle()}</title>
        <meta name="title" content={generateTitle()} />
        <meta name="description" content={generateDescription()} />
        <meta name="keywords" content={SEO_KEYWORDS.join(', ')} />
        <link rel="canonical" href={SITE_INFO.url} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_INFO.url} />
        <meta property="og:title" content={generateTitle()} />
        <meta property="og:description" content={generateDescription()} />
        <meta property="og:image" content={SITE_INFO.image} />
        <meta property="og:site_name" content={SITE_INFO.name} />
        <meta property="og:locale" content="id_ID" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={SITE_INFO.url} />
        <meta property="twitter:title" content={generateTitle()} />
        <meta property="twitter:description" content={generateDescription()} />
        <meta property="twitter:image" content={SITE_INFO.image} />
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Indonesian" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content={SITE_INFO.name} />
        <meta name="publisher" content="Muhammadiyah" />
        
        {/* Geo Tags */}
        <meta name="geo.region" content="ID-JK" />
        <meta name="geo.placename" content="Jakarta Selatan" />
        <meta name="geo.position" content={`${SITE_INFO.latitude};${SITE_INFO.longitude}`} />
        <meta name="ICBM" content={`${SITE_INFO.latitude}, ${SITE_INFO.longitude}`} />
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify(getOrganizationSchema())}
        </script>
        
        {/* Structured Data - Local Business */}
        <script type="application/ld+json">
          {JSON.stringify(getLocalBusinessSchema())}
        </script>
        
        {/* Structured Data - Breadcrumb */}
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbSchema([
            { name: 'Home', url: SITE_INFO.url }
          ]))}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white font-roboto text-gray-800">
        <Navigation onRegisterClick={scrollToRegistration} />
        
        <main>
          <HeroSection onRegisterClick={scrollToRegistration} />
          <WelcomeSection onRegisterClick={scrollToRegistration} />
          <PricingSection onRegisterClick={scrollToRegistration} />
          <FlyerSection onRegisterClick={scrollToRegistration} />
          <ProgramsSection />
          <QuoteSection />
          <AchievementsSection />
          <NewsSection />
          <GallerySection />
          <FacilitiesSection />
          <OnlinePortalSection />
          <RegistrationSection />
          <GoogleMapSection />
        </main>

        <Footer />
        <BackToTop show={showBackToTop} />
        <Toaster />
      </div>
    </>
  );
}

export default App;