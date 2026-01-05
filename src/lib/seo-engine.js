// SEO AI Engine for SMP Muhammadiyah 35 Jakarta
// Generates optimized slugs, meta descriptions, SEO titles, LSI keywords, and CTR scores

const INDONESIAN_STOPWORDS = [
  'dan', 'yang', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'adalah',
  'ini', 'itu', 'atau', 'oleh', 'dalam', 'akan', 'telah', 'tidak', 'ada',
  'juga', 'nya', 'saya', 'kami', 'kita', 'mereka', 'tersebut', 'sebagai',
  'dapat', 'harus', 'sudah', 'masih', 'sangat', 'lebih', 'bisa', 'bila'
];

const POWER_WORDS = [
  'prestasi', 'juara', 'terbaik', 'unggulan', 'sukses', 'raih', 'menang',
  'kompetisi', 'olimpiade', 'nasional', 'internasional', 'eksklusif',
  'spesial', 'gratis', 'diskon', 'promo', 'terbaru', 'update', 'hebat'
];

/**
 * Generate SEO-friendly slug from title
 * Rules: lowercase, hyphenated, no stopwords, max 8-10 words
 */
export const generateSlug = (title, maxWords = 10) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^\w\s-]/g, '') // remove special chars except hyphen
    .split(/\s+/)
    .filter(word => word.length > 0)
    .filter(word => !INDONESIAN_STOPWORDS.includes(word))
    .slice(0, maxWords)
    .join('-')
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, ''); // trim hyphens from start/end
};

/**
 * Generate SEO title in format: {Main Topic} | {School Name}
 */
export const generateSEOTitle = (title) => {
  if (!title) return 'SMP Muhammadiyah 35 Jakarta';
  
  const schoolName = 'SMP Muhammadiyah 35 Jakarta';
  
  // If already contains school name, return as-is
  if (title.includes(schoolName)) return title;
  
  // Clean up title and append school name
  const cleanTitle = title
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60); // limit main topic to 60 chars
  
  return `${cleanTitle} | ${schoolName}`;
};

/**
 * Generate meta description (150-160 chars, human-readable, contains keyphrase)
 */
export const generateMetaDescription = (content, title, keyphrase = '', maxLength = 160) => {
  if (!content || content.trim().length === 0) {
    return `Informasi terbaru dari SMP Muhammadiyah 35 Jakarta tentang ${title || 'kegiatan sekolah'}.`;
  }
  
  // Strip HTML tags and get plain text
  const plainText = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Try to find a sentence containing the keyphrase
  let description = '';
  if (keyphrase) {
    const sentences = plainText.split(/[.!?]+/);
    const relevantSentence = sentences.find(s => 
      s.toLowerCase().includes(keyphrase.toLowerCase())
    );
    if (relevantSentence) {
      description = relevantSentence.trim();
    }
  }
  
  // Fallback to first sentences
  if (!description) {
    description = plainText.slice(0, maxLength + 50);
  }
  
  // Ensure it includes school mention
  if (!description.toLowerCase().includes('smp muhammadiyah')) {
    description = `SMP Muhammadiyah 35 Jakarta - ${description}`;
  }
  
  // Trim to max length at word boundary
  if (description.length > maxLength) {
    description = description.slice(0, maxLength);
    const lastSpace = description.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      description = description.slice(0, lastSpace);
    }
    description = description.trim() + '...';
  }
  
  return description;
};

/**
 * Extract LSI (Latent Semantic Indexing) keywords from content
 * Returns 5 most relevant keywords
 */
export const extractLSIKeywords = (content, title = '') => {
  if (!content) return [];
  
  const text = `${title} ${content}`
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
  
  const words = text.split(' ')
    .filter(w => w.length > 3)
    .filter(w => !INDONESIAN_STOPWORDS.includes(w));
  
  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Sort by frequency and return top 5
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
};

/**
 * Calculate CTR (Click-Through Rate) probability score
 * Based on: title length, power words, clarity, numbers
 * Returns score 0-100
 */
export const calculateCTRScore = (title, description = '') => {
  if (!title) return 0;
  
  let score = 50; // base score
  
  // Title length optimization (50-60 chars ideal)
  const titleLength = title.length;
  if (titleLength >= 50 && titleLength <= 60) {
    score += 15;
  } else if (titleLength >= 40 && titleLength <= 70) {
    score += 10;
  } else if (titleLength < 30) {
    score -= 10;
  } else if (titleLength > 80) {
    score -= 15;
  }
  
  // Power words boost
  const lowerTitle = title.toLowerCase();
  const powerWordCount = POWER_WORDS.filter(word => 
    lowerTitle.includes(word)
  ).length;
  score += Math.min(powerWordCount * 5, 20);
  
  // Numbers in title (years, rankings, etc.)
  if (/\d/.test(title)) {
    score += 10;
  }
  
  // Question format
  if (title.includes('?')) {
    score += 5;
  }
  
  // Description quality
  if (description && description.length >= 120 && description.length <= 160) {
    score += 10;
  }
  
  // Ensure score is within 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Generate complete SEO data for an article
 */
export const generateArticleSEO = (article) => {
  const { title = '', content = '', seo = {} } = article;
  
  // Only generate defaults if fields are empty (preserve manual edits)
  const slug = seo.slug || generateSlug(title);
  const seoTitle = seo.seoTitle || generateSEOTitle(title);
  const keyphrase = seo.focusKeyphrase || '';
  const seoDescription = seo.seoDescription || generateMetaDescription(content, title, keyphrase);
  const lsiKeywords = seo.lsiKeywords?.length > 0 ? seo.lsiKeywords : extractLSIKeywords(content, title);
  const ctrScore = calculateCTRScore(seoTitle, seoDescription);
  
  return {
    slug,
    seoTitle,
    seoDescription,
    focusKeyphrase: keyphrase,
    lsiKeywords,
    ctrScore,
  };
};

/**
 * Validate and sanitize SEO fields
 */
export const validateSEO = (seoData) => {
  const errors = [];
  
  if (!seoData.slug || seoData.slug.length < 3) {
    errors.push('Slug terlalu pendek (minimal 3 karakter)');
  }
  
  if (seoData.seoTitle && seoData.seoTitle.length > 70) {
    errors.push('SEO Title terlalu panjang (maksimal 70 karakter)');
  }
  
  if (seoData.seoDescription && seoData.seoDescription.length > 160) {
    errors.push('Meta Description terlalu panjang (maksimal 160 karakter)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
