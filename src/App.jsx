import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
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
import GalleryIndexPage from '@/components/pages/GalleryIndexPage';
import PhotoGallery from '@/components/pages/PhotoGallery';
import VideoGallery from '@/components/pages/VideoGallery';
import InfographicGallery from '@/components/pages/InfographicGallery';
import EModulePage from '@/components/pages/EModulePage';
import PrestasiPage from '@/components/pages/PrestasiPage';
import NewsListPage from '@/pages/news/NewsListPage';
import { SITE_INFO, SEO_KEYWORDS, generateTitle, generateDescription, getOrganizationSchema, getLocalBusinessSchema, getBreadcrumbSchema } from '@/lib/seo-utils';

const MainLayout = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToRegistration = () => {
    if (location.pathname !== '/') {
      navigate('/#registration');
      return;
    }
    const element = document.getElementById('registration');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-roboto text-gray-800">
      <Navigation onRegisterClick={scrollToRegistration} />
      <Outlet />
      <Footer />
      <BackToTop show={showBackToTop} />
      <Toaster />
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToRegistration = () => {
    if (location.pathname !== '/') {
      navigate('/#registration');
      return;
    }
    const element = document.getElementById('registration');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <html lang="id" />
        <title>{generateTitle()}</title>
        <meta name="title" content={generateTitle()} />
        <meta name="description" content={generateDescription()} />
        <meta name="keywords" content={SEO_KEYWORDS.join(', ')} />
        <link rel="canonical" href={SITE_INFO.url} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_INFO.url} />
        <meta property="og:title" content={generateTitle()} />
        <meta property="og:description" content={generateDescription()} />
        <meta property="og:image" content={SITE_INFO.image} />
        <meta property="og:site_name" content={SITE_INFO.name} />
        <meta property="og:locale" content="id_ID" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={SITE_INFO.url} />
        <meta property="twitter:title" content={generateTitle()} />
        <meta property="twitter:description" content={generateDescription()} />
        <meta property="twitter:image" content={SITE_INFO.image} />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Indonesian" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content={SITE_INFO.name} />
        <meta name="publisher" content="Muhammadiyah" />
        <meta name="geo.region" content="ID-JK" />
        <meta name="geo.placename" content="Jakarta Selatan" />
        <meta name="geo.position" content={`${SITE_INFO.latitude};${SITE_INFO.longitude}`} />
        <meta name="ICBM" content={`${SITE_INFO.latitude}, ${SITE_INFO.longitude}`} />
        <script type="application/ld+json">{JSON.stringify(getOrganizationSchema())}</script>
        <script type="application/ld+json">{JSON.stringify(getLocalBusinessSchema())}</script>
        <script type="application/ld+json">{JSON.stringify(getBreadcrumbSchema([{ name: 'Home', url: SITE_INFO.url }]))}</script>
      </Helmet>

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
    </>
  );
};

const ArticleDetailRoute = () => {
  const { slug } = useParams();
  return <ArticleDetail slugParam={slug} />;
};

const PreviewArticleRoute = () => {
  const { id } = useParams();
  const numericId = id ? parseInt(id, 10) : null;
  return <ArticleDetail articleId={numericId} />;
};

const LegacyArticleRedirect = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) navigate(`/news/${slug}`, { replace: true });
    else navigate('/news', { replace: true });
  }, [slug, navigate]);

  return null;
};

const AdminPage = () => (
  <>
    <Helmet>
      <html lang="id" />
      <title>{generateTitle('Admin Dashboard')}</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <AdminDashboard />
    <Toaster />
  </>
);

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="news" element={<NewsListPage />} />
        <Route path="news/:slug" element={<ArticleDetailRoute />} />
        <Route path="preview/article/:id" element={<PreviewArticleRoute />} />
        <Route path="article/:slug" element={<LegacyArticleRedirect />} />
        <Route path="profile/staff" element={<StaffPage />} />
        <Route path="profile/vision-mission" element={<VisionMissionPage />} />
        <Route path="profile/history" element={<HistoryPage />} />
        <Route path="gallery" element={<GalleryIndexPage />} />
        <Route path="gallery/photos" element={<PhotoGallery />} />
        <Route path="gallery/videos" element={<VideoGallery />} />
        <Route path="gallery/infographics" element={<InfographicGallery />} />
        <Route path="student/e-module" element={<EModulePage />} />
        <Route path="student/prestasi" element={<PrestasiPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;