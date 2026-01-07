// SEO Utility Functions and Constants for SMP Muhammadiyah 35 Jakarta

export const SITE_INFO = {
  name: 'SMP Muhammadiyah 35 Jakarta',
  fullName: 'SMP Muhammadiyah 35 Jakarta - Islamic & Global School',
  type: 'Islamic & Global School',
  accreditation: 'A',
  owner: 'Yayasan Muhammadiyah',
  npsn: '20106980',
  phone: '(021) 7210785',
  address: 'Jl. Panjang No.19, RT.8/RW.9, Cipulir, Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12230',
  addressShort: 'Jl. Panjang No.19, Cipulir, Jakarta Selatan',
  city: 'Jakarta Selatan',
  province: 'DKI Jakarta',
  postalCode: '12230',
  country: 'Indonesia',
  latitude: '-6.2607',
  longitude: '106.7794',
  url: 'https://smpmuh35jakarta.sch.id',
  logo: 'https://smpmuh35jakarta.sch.id/logo.png',
  image: 'https://smpmuh35jakarta.sch.id/og-image.jpg',
  email: 'smpmuh35@gmail.com',
  socialMedia: {
    instagram: 'https://instagram.com/smpmuh35jakarta',
    youtube: 'https://youtube.com/@smpmuh35jakarta',
    facebook: 'https://facebook.com/smpmuh35jakarta',
  },
  academicYear: '2026/2027',
  programs: ['Tahfidz & Tahsin Bersanad', 'ISMUBA', 'LMS', 'Student Exchange', 'International Class'],
};

export const SEO_KEYWORDS = [
  'SMP Muhammadiyah 35 Jakarta',
  'Sekolah Islami Terbaik Jakarta Selatan',
  'Islamic & Global School Jakarta',
  'PPDB SMP Muhammadiyah 35 Jakarta',
  'Biaya Masuk SMP Muhammadiyah 35 Jakarta',
  'Sekolah Berbasis LMS Jakarta',
  'Tahfidz & Tahsin Bersanad',
  'SMP Islami Jakarta Selatan',
  'Sekolah Muhammadiyah Jakarta',
  'PPDB Online Jakarta',
  'Sekolah Tahfidz Jakarta',
];

// Generate page title
export const generateTitle = (pageName = '') => {
  if (!pageName) return SITE_INFO.fullName + ' | PPDB ' + SITE_INFO.academicYear;
  return `${pageName} | ${SITE_INFO.name} | ${SITE_INFO.type} | PPDB ${SITE_INFO.academicYear}`;
};

// Generate meta description
export const generateDescription = (customDescription = '') => {
  const defaultDescription = `Pendaftaran Peserta Didik Baru (PPDB) ${SITE_INFO.name} Tahun Ajaran ${SITE_INFO.academicYear}. Sekolah Islami Terbaik Jakarta Selatan dengan Akreditasi ${SITE_INFO.accreditation}. Program unggulan: ${SITE_INFO.programs.slice(0, 3).join(', ')}. Daftar sekarang!`;
  return customDescription || defaultDescription;
};

// Organization Schema
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: SITE_INFO.name,
  alternateName: SITE_INFO.fullName,
  url: SITE_INFO.url,
  logo: SITE_INFO.logo,
  image: SITE_INFO.image,
  description: generateDescription(),
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jl. Panjang No.19, RT.8/RW.9, Cipulir',
    addressLocality: 'Kebayoran Lama',
    addressRegion: SITE_INFO.province,
    postalCode: SITE_INFO.postalCode,
    addressCountry: 'ID',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: SITE_INFO.latitude,
    longitude: SITE_INFO.longitude,
  },
  telephone: SITE_INFO.phone,
  email: SITE_INFO.email,
  sameAs: Object.values(SITE_INFO.socialMedia),
  parentOrganization: {
    '@type': 'Organization',
    name: SITE_INFO.owner,
  },
});

// Local Business Schema
export const getLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'School',
  name: SITE_INFO.name,
  image: SITE_INFO.image,
  '@id': SITE_INFO.url,
  url: SITE_INFO.url,
  telephone: SITE_INFO.phone,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE_INFO.address,
    addressLocality: SITE_INFO.city,
    postalCode: SITE_INFO.postalCode,
    addressCountry: 'ID',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: SITE_INFO.latitude,
    longitude: SITE_INFO.longitude,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '15:00',
    },
  ],
});

// Breadcrumb Schema Generator
export const getBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Article Schema Generator
export const getArticleSchema = (article) => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: article.title,
  image: article.image || SITE_INFO.image,
  datePublished: article.publishDate,
  dateModified: article.modifiedDate || article.publishDate,
  author: {
    '@type': 'Person',
    name: article.author || 'Admin',
    jobTitle: article.authorRole || 'Superadmin',
  },
  publisher: {
    '@type': 'Organization',
    name: SITE_INFO.name,
    logo: {
      '@type': 'ImageObject',
      url: SITE_INFO.logo,
    },
  },
  description: article.description || article.excerpt,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': article.url,
  },
});

// FAQ Schema Generator
export const getFAQSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// Common PPDB FAQs
export const PPDB_FAQS = [
  {
    question: 'Berapa biaya masuk SMP Muhammadiyah 35 Jakarta?',
    answer: 'Biaya masuk SMP Muhammadiyah 35 Jakarta bervariasi tergantung program yang dipilih. Untuk informasi detail biaya PPDB tahun ajaran 2026/2027, silakan hubungi kantor administrasi di (021) 7210785 atau kunjungi website resmi kami. Kami juga menyediakan berbagai program beasiswa untuk siswa berprestasi.',
  },
  {
    question: 'Apakah ada program Tahfidz di SMP Muhammadiyah 35 Jakarta?',
    answer: 'Ya, SMP Muhammadiyah 35 Jakarta memiliki program Tahfidz & Tahsin Bersanad sebagai salah satu program unggulan. Program ini membimbing siswa untuk menghafal Al-Quran dengan metode yang terstruktur dan dibimbing oleh guru-guru yang bersanad. Siswa juga mendapatkan pembelajaran tahsin untuk memperbaiki bacaan Al-Quran.',
  },
  {
    question: 'Apakah PPDB SMP Muhammadiyah 35 Jakarta sudah dibuka?',
    answer: 'PPDB SMP Muhammadiyah 35 Jakarta untuk tahun ajaran 2026/2027 telah dibuka. Pendaftaran dapat dilakukan secara online melalui website resmi kami atau datang langsung ke sekolah. Untuk informasi lengkap jadwal dan persyaratan pendaftaran, silakan hubungi (021) 7210785.',
  },
  {
    question: 'Dimana lokasi SMP Muhammadiyah 35 Jakarta?',
    answer: 'SMP Muhammadiyah 35 Jakarta berlokasi di Jl. Panjang No.19, RT.8/RW.9, Cipulir, Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12230. Sekolah kami mudah diakses dengan transportasi umum dan memiliki fasilitas parkir yang memadai.',
  },
  {
    question: 'Apa saja program unggulan SMP Muhammadiyah 35 Jakarta?',
    answer: 'Program unggulan SMP Muhammadiyah 35 Jakarta meliputi: Tahfidz & Tahsin Bersanad, ISMUBA (Al-Islam, Kemuhammadiyahan, Bahasa Arab), Pembelajaran Berbasis LMS (Learning Management System), International Class, dan Student Exchange Program. Semua program dirancang untuk mengembangkan potensi akademik dan karakter Islami siswa.',
  },
];

// Generate Share URLs
export const getShareUrls = (url, title) => ({
  whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
});
