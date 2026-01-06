import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Eye, Save, Upload, Check, X,
  FileText, Calendar, User, Tag, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import RichTextEditor from './RichTextEditor';
import { SITE_INFO } from '@/lib/seo-utils';
import { generateArticleSEO, generateSlug, calculateCTRScore } from '@/lib/seo-engine';
import { validateImageFile } from '@/lib/api-utils';
import { listArticles, createArticle, updateArticle, deleteArticle, reorderArticles } from '@/lib/articlesApi';
import { MESSAGES } from '@/config/staticMode';

const NewsManager = ({ user, channel }) => {
  const { toast } = useToast();
  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [articles, setArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [filter, setFilter] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const featuredImageInputRef = React.useRef(null);
  const featuredImageFileRef = React.useRef(null);

  const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'draft',
    featuredImage: '',
    featuredImageAlt: '',
    featuredImageName: ''
  });

  const [seoData, setSeoData] = useState({
    focusKeyphrase: '',
    seoTitle: '',
    slug: '',
    metaDescription: '',
    readabilityScore: 0,
    seoScore: 0,
    keywordSuggestions: [],
    aiNotes: [],
    lsiKeywords: [],
    ctrScore: 0
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const STOP_WORDS = ['the','a','an','of','for','and','or','but','with','yang','dan','di','ke','dari','para','akan','untuk','pada','dalam','ada','itu','ini','atau','sebagai','dengan','serta','karena'];

  const stripHtmlToText = (html) => html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';

  const truncateAtWord = (text, max) => {
    if (!text) return '';
    if (text.length <= max) return text;
    const truncated = text.slice(0, max);
    const lastSpace = truncated.lastIndexOf(' ');
    return `${truncated.slice(0, lastSpace > 0 ? lastSpace : max).trim()}...`;
  };

  const sanitizeSlug = (input) => {
    if (!input) return '';
    const cleaned = input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .filter(word => !STOP_WORDS.includes(word))
      .join('-')
      .replace(/-+/g, '-');
    return cleaned.slice(0, 120).replace(/(^-|-$)+/g, '') || 'artikel';
  };

  const limitFocusWords = (value) => {
    if (!value) return '';
    const words = value.trim().split(/\s+/).slice(0, 8);
    return words.join(' ');
  };

  const limitMetaDescription = (value) => {
    if (!value) return '';
    return truncateAtWord(value.trim(), 160);
  };

  const ensureSeoObject = (seo = {}) => ({
    ...defaultSeo,
    ...seo,
    keywordSuggestions: Array.isArray(seo.keywordSuggestions) ? seo.keywordSuggestions : [],
    aiNotes: Array.isArray(seo.aiNotes) ? seo.aiNotes : []
  });

  const extractFirstParagraph = (html) => {
    if (!html) return '';
    const text = html.split(/<p[^>]*>/i).map(part => part.split(/<\/p>/i)[0]).filter(Boolean)[0];
    return stripHtmlToText(text || html);
  };

  const extractKeywords = (text, limit = 8) => {
    if (!text) return [];
    const counts = {};
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.includes(word))
      .forEach(word => {
        counts[word] = (counts[word] || 0) + 1;
      });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word)
      .filter((word, idx, arr) => arr.indexOf(word) === idx)
      .slice(0, limit);
  };

  const calculateReadability = (text) => {
    if (!text) return 0;
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    const words = text.split(/\s+/).filter(Boolean);
    let score = 100;

    sentences.forEach(sentence => {
      const wordCount = sentence.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 20) score -= 3;
      if (wordCount > 30) score -= 3;
    });

    paragraphs.forEach(p => {
      const wordCount = p.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 120) score -= 5;
    });

    const commaCount = (text.match(/,/g) || []).length;
    if (commaCount > words.length * 0.05) score -= 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const calculateSeoScore = ({ title, contentText, contentHtml, focusKeyphrase, metaDescription, slug, featuredImage, readabilityScore }) => {
    let score = 0;
    const lowerFocus = (focusKeyphrase || '').toLowerCase();
    const lowerTitle = (title || '').toLowerCase();
    const lowerContent = (contentText || '').toLowerCase();
    const firstParagraph = (contentText || '').split(/\n+/)[0]?.toLowerCase() || lowerContent.slice(0, 200);
    const lowerMeta = (metaDescription || '').toLowerCase();
    const lowerSlug = (slug || '').toLowerCase();
    const wordCount = (contentText || '').split(/\s+/).filter(Boolean).length;
    const hasImageAlt = (contentHtml || '').toLowerCase().includes('alt="') || (contentHtml || '').toLowerCase().includes("alt='");
    const focusInContentCount = lowerFocus ? (lowerContent.match(new RegExp(`\\b${lowerFocus.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, 'g')) || []).length : 0;

    if (lowerFocus && lowerTitle.includes(lowerFocus)) score += 20;
    if (lowerFocus && firstParagraph.includes(lowerFocus)) score += 20;
    if (lowerFocus && lowerMeta.includes(lowerFocus)) score += 10;
    if (lowerFocus && lowerSlug.includes(lowerFocus.replace(/\s+/g, '-'))) score += 10;
    if (wordCount > 300) score += 10;
    if (lowerFocus && focusInContentCount > 1) score += 10;
    if (hasImageAlt) score += 10;
    if (readabilityScore >= 70) score += 10;

    if (lowerFocus && wordCount > 0) {
      const focusWords = lowerFocus.split(/\s+/).filter(Boolean).length || 1;
      const density = (focusInContentCount * focusWords) / Math.max(wordCount, 1);
      if (density > 0.035) score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  };

  const buildAiNotes = ({ focusKeyphrase, title, contentText, metaDescription, slug, seoScore, readabilityScore }) => {
    const notes = [];
    const lowerFocus = (focusKeyphrase || '').toLowerCase();
    if (!lowerFocus) notes.push('Tambahkan Focus Keyphrase agar SEO dapat dianalisa.');
    if (lowerFocus && !(contentText || '').toLowerCase().slice(0, 220).includes(lowerFocus)) {
      notes.push('Letakkan keyphrase pada paragraf pertama.');
    }
    if ((metaDescription || '').length < 130) {
      notes.push('Meta Description terlalu pendek (target 130–160 karakter).');
    }
    if ((metaDescription || '').length > 160) {
      notes.push('Meta Description terlalu panjang (maksimal 160 karakter).');
    }
    if ((title || '').length > 60) {
      notes.push('Judul SEO terlalu panjang (maksimal 60 karakter).');
    }
    if (!slug) {
      notes.push('Slug belum diisi.');
    }
    if ((contentText || '').split(/\s+/).filter(Boolean).length < 300) {
      notes.push('Panjang artikel masih kurang dari 300 kata.');
    }
    if (seoScore >= 80 && readabilityScore >= 70 && notes.length === 0) {
      notes.push('Tampilan SEO artikel ini sudah sangat baik. Pertahankan!');
    }
    notes.push('Tambahkan alt text pada gambar.');
    notes.push('Hindari penggunaan keyphrase yang terlalu berlebihan.');
    return Array.from(new Set(notes)).slice(0, 10);
  };

  const runSeoAssistant = () => {
    const text = stripHtmlToText(formData.content);
    
    // Use the new SEO engine to generate SEO data
    const generatedSEO = generateArticleSEO({
      title: formData.title,
      content: formData.content,
      seo: {
        slug: seoEdited.slug ? seoData.slug : '',
        seoTitle: seoEdited.seoTitle ? seoData.seoTitle : '',
        seoDescription: seoEdited.metaDescription ? seoData.metaDescription : '',
        focusKeyphrase: seoEdited.focusKeyphrase ? seoData.focusKeyphrase : '',
        lsiKeywords: seoData.lsiKeywords
      }
    });

    const keywords = extractKeywords(`${formData.title} ${text} ${formData.tags} ${formData.hashtags}`, 8);
    const readabilityScore = calculateReadability(text);
    const seoScore = calculateSeoScore({
      title: formData.title,
      contentText: text,
      contentHtml: formData.content,
      focusKeyphrase: generatedSEO.focusKeyphrase,
      metaDescription: generatedSEO.seoDescription,
      slug: generatedSEO.slug,
      featuredImage: formData.featuredImage,
      readabilityScore
    });

    const aiNotes = buildAiNotes({
      focusKeyphrase: generatedSEO.focusKeyphrase,
      title: formData.title,
      contentText: text,
      metaDescription: generatedSEO.seoDescription,
      slug: generatedSEO.slug,
      seoScore,
      readabilityScore
    });

    setSeoData(prev => ({
      ...prev,
      focusKeyphrase: generatedSEO.focusKeyphrase,
      seoTitle: generatedSEO.seoTitle,
      slug: generatedSEO.slug,
      metaDescription: generatedSEO.seoDescription,
      lsiKeywords: generatedSEO.lsiKeywords,
      ctrScore: generatedSEO.ctrScore,
      readabilityScore,
      seoScore,
      keywordSuggestions: keywords,
      aiNotes
    }));
  };

  useEffect(() => {
    loadArticles();
  }, [channel]);

  useEffect(() => {
    const timer = setTimeout(runSeoAssistant, 1000);
    return () => clearTimeout(timer);
  }, [formData.title, formData.content, formData.excerpt, formData.tags, formData.hashtags, seoEdited.focusKeyphrase, seoEdited.seoTitle, seoEdited.slug, seoEdited.metaDescription]);

  const loadArticles = () => {
    const allNews = db.getNews();
    setArticles(allNews.filter(a => !channel || a.channel === channel));
  };

  const toDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await listArticles({ status: 'all', limit: 100 });
      setArticles(data.items || []);
    } catch (e) {
      console.error('[NewsManager] Load failed:', e);
      toast({ variant: 'destructive', title: 'Load failed', description: e.message });
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({ variant: 'destructive', title: 'File invalid', description: validation.error });
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ 
          ...prev, 
          featuredImage: reader.result,
          featuredImageName: file.name
        }));
        featuredImageFileRef.current = file;
      };
      reader.readAsDataURL(file);
      toast({ title: 'Image ready', description: 'Featured image ready to upload' });
    } catch (err) {
      console.error('[NewsManager] Image prep failed:', err);
      toast({ variant: 'destructive', title: 'Image prep failed', description: err.message });
    } finally {
      setUploadingImage(false);
      if (featuredImageInputRef.current) featuredImageInputRef.current.value = '';
    }
  };

  const handleCreateNew = () => {
    setCurrentArticle(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      tags: [],
      status: 'draft',
      featuredImage: '',
      featuredImageAlt: '',
      featuredImageName: ''
    });
    setSeoData({
      focusKeyphrase: '',
      seoTitle: '',
      slug: '',
      metaDescription: '',
      readabilityScore: 0,
      seoScore: 0,
      keywordSuggestions: [],
      aiNotes: [],
      lsiKeywords: [],
      ctrScore: 0
    });
    setView('editor');
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title and content required' });
      return;
    }

    try {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9\-]/g, '-').replace(/-+/g, '-').slice(0, 120);
      
      if (currentArticle) {
        await updateArticle({
          id: currentArticle.id,
          title: formData.title,
          slug: currentArticle.slug || slug,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          tags: Array.isArray(formData.tags) ? formData.tags : [],
          status: formData.status,
          seo_title: seoData.seoTitle,
          seo_description: seoData.metaDescription,
          featured_image: featuredImageFileRef.current,
          keep_image: !featuredImageFileRef.current
        });
        toast({ title: 'Article updated' });
      } else {
        await createArticle({
          title: formData.title,
          slug,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          tags: Array.isArray(formData.tags) ? formData.tags : [],
          status: formData.status,
          seo_title: seoData.seoTitle,
          seo_description: seoData.metaDescription,
          featured_image: featuredImageFileRef.current
        });
        toast({ title: 'Article created' });
      }
      
      setView('list');
      featuredImageFileRef.current = null;
      await loadArticles();
    } catch (err) {
      console.error('[NewsManager] Save failed:', err);
      toast({ variant: 'destructive', title: 'Save failed', description: err.message });
    }
  };

  const handleEdit = (article) => {
    setCurrentArticle(article);
    setFormData({
      title: article.title,
      content: article.content_html || '',
      excerpt: article.excerpt || '',
      category: article.category || '',
      tags: Array.isArray(article.tags) ? article.tags : (article.tags_json ? JSON.parse(article.tags_json) : []),
      status: article.status,
      featuredImage: article.featured_image_url || '',
      featuredImageAlt: article.featured_image_alt || '',
      featuredImageName: article.featured_image || ''
    });
    setSeoData({
      focusKeyphrase: '',
      seoTitle: article.seo_title || '',
      slug: article.slug,
      metaDescription: article.seo_description || '',
      readabilityScore: 0,
      seoScore: 0,
      keywordSuggestions: [],
      aiNotes: [],
      lsiKeywords: [],
      ctrScore: 0
    });
    setView('editor');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await deleteArticle(id);
      toast({ title: 'Article deleted' });
      await loadArticles();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Delete failed', description: err.message });
    }
  };

  const handleSave = () => {
    // Auto calculate read time
    const wordCount = stripHtmlToText(formData.content).split(/\s+/).filter(Boolean).length;
    const readTime = Math.ceil(wordCount / 200);

    // Process hashtags
    const processHashtags = (input) => {
      if (!input || !input.trim()) return [];
      
      const tags = input.split(/[,\s]+/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`)
        .filter(tag => tag.length <= 31) // max 30 chars + #
        .filter((tag, index, self) => self.indexOf(tag) === index) // remove duplicates
        .slice(0, 10); // max 10 hashtags
      
      return tags;
    };

    const textContent = stripHtmlToText(formData.content);
    const keywordSuggestions = (seoData.keywordSuggestions && seoData.keywordSuggestions.length > 0)
      ? seoData.keywordSuggestions
      : extractKeywords(`${formData.title} ${textContent} ${formData.tags} ${formData.hashtags}`, 8);

    const finalSlug = sanitizeSlug(seoData.slug || formData.title || currentArticle?.slug || 'artikel');
    const finalFocus = limitFocusWords(seoData.focusKeyphrase || keywordSuggestions.slice(0, 4).join(' '));
    const finalSeoTitle = seoData.seoTitle || (formData.title ? truncateAtWord(`${formData.title} | SMP Muhammadiyah 35 Jakarta`, 60) : '');
    const fallbackDescription = formData.excerpt || textContent.slice(0, 240) || formData.title;
    let finalMetaDescription = limitMetaDescription(seoData.metaDescription || fallbackDescription || '');
    if (finalFocus && !finalMetaDescription.toLowerCase().includes(finalFocus.toLowerCase())) {
      finalMetaDescription = limitMetaDescription(`${finalFocus}. ${finalMetaDescription}`);
    }

    const readabilityScore = calculateReadability(textContent);
    const seoScore = calculateSeoScore({
      title: formData.title,
      contentText: textContent,
      contentHtml: formData.content,
      focusKeyphrase: finalFocus,
      metaDescription: finalMetaDescription,
      slug: finalSlug,
      featuredImage: formData.featuredImage
    });
    const aiNotes = buildAiNotes({
      focusKeyphrase: finalFocus,
      title: formData.title,
      contentText: textContent,
      metaDescription: finalMetaDescription,
      slug: finalSlug
    });

    const articleData = {
      id: currentArticle?.id,
      ...formData,
      hashtags: processHashtags(formData.hashtags),
      slug: finalSlug,
      channel: channel || 'school',
      authorId: currentArticle?.authorId || user.id,
      authorName: currentArticle?.authorName || user.name,
      authorRole: currentArticle?.authorRole || user.role,
      readTime,
      updatedAt: new Date().toISOString(),
      seo: ensureSeoObject({
        focusKeyphrase: finalFocus,
        seoTitle: finalSeoTitle,
        slug: finalSlug,
        metaDescription: finalMetaDescription,
        readabilityScore,
        seoScore,
        keywordSuggestions,
        aiNotes
      })
    };

    db.saveNews(articleData, user.id);
    toast({ title: "Article saved successfully" });
    setView('list');
    loadArticles();
  };

  if (view === 'editor') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center sticky top-0 z-10 bg-gray-50/95 backdrop-blur py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {currentArticle ? 'Edit Article' : 'New Article'}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              {currentArticle && (
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`/preview/article/${currentArticle.id}`, '_blank')}
                  className="gap-2"
                >
                  <Eye size={18} /> Preview Post
                </Button>
              )}
            <Button onClick={handleSave} className="bg-[#5D9CEC] hover:bg-[#4A89DC] gap-2">
              <Save size={18} /> {formData.status === 'published' ? 'Update & Publish' : 'Save Draft'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full text-xl font-bold p-3 border-b-2 border-gray-100 focus:border-[#5D9CEC] outline-none transition-colors"
                placeholder="Enter article title here..."
              />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <RichTextEditor 
                value={formData.content} 
                onChange={content => setFormData({...formData, content})} 
              />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={e => setFormData({...formData, excerpt: e.target.value})}
                className="w-full p-3 border rounded-xl h-24 text-sm"
                placeholder="Short summary for list view..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-[#5D9CEC]" /> Publish Info
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Review</option>
                    {(user.role === 'Admin' || user.role === 'Superadmin') && (
                      <option value="published">Published</option>
                    )}
                  </select>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>Author: <span className="font-medium text-gray-800">{currentArticle?.authorName || user.name}</span></p>
                  {currentArticle && currentArticle.createdAt && (
                    <p className="mt-1">Created: {new Date(currentArticle.createdAt).toLocaleDateString('id-ID')}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ImageIcon size={18} className="text-[#5D9CEC]" /> Featured Image
              </h3>
              <div className="space-y-3">
                {formData.featuredImage && (
                  <div className="relative">
                    <img src={formData.featuredImage} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => setFormData({...formData, featuredImage: ''})}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <input
                  ref={featuredImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFeaturedImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                <Button 
                  type="button"
                  onClick={() => featuredImageInputRef.current?.click()}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : (formData.featuredImage ? 'Ganti Gambar' : 'Upload Gambar')}
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={formData.featuredImageName}
                    onChange={e => setFormData({...formData, featuredImageName: e.target.value})}
                    placeholder="Nama Gambar (SEO)"
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={formData.featuredImageAlt}
                    onChange={e => setFormData({...formData, featuredImageAlt: e.target.value})}
                    placeholder="ALT Text"
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={formData.featuredImageTitle}
                    onChange={e => setFormData({...formData, featuredImageTitle: e.target.value})}
                    placeholder="TITLE (SEO)"
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <input
                  type="text"
                  value={formData.featuredImage}
                  onChange={e => setFormData({...formData, featuredImage: e.target.value})}
                  placeholder="Atau paste URL gambar..."
                  className="w-full p-2 border rounded-lg text-sm"
                />
                <p className="text-xs text-gray-500">JPG, PNG, WebP • Max 4MB</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Tag size={18} className="text-[#5D9CEC]" /> Meta Data
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    <option>Berita</option>
                    <option>Prestasi</option>
                    <option>Kegiatan</option>
                    <option>Pengumuman</option>
                    <option>Artikel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="comma, separated, tags"
                  />
                </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Hashtags</label>
                    <input
                      type="text"
                      value={formData.hashtags}
                      onChange={e => setFormData({...formData, hashtags: e.target.value})}
                      className="w-full p-2 border rounded-lg text-sm"
                      placeholder="expo muhammadiyah milad"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Max 10 hashtags, 30 chars each</p>
                  </div>
              </div>
            </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-[#5D9CEC]" /> SEO Panel
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Focus Keyphrase</label>
                    <input
                      type="text"
                      value={seoData.focusKeyphrase}
                      onChange={e => handleSeoChange('focusKeyphrase', e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                      placeholder="contoh: muhammadiyah expo 2026 jakarta"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Max 8 words</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={seoData.seoTitle}
                      onChange={e => handleSeoChange('seoTitle', e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                      placeholder="Judul SEO"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                    <input
                      type="text"
                      value={seoData.slug}
                      onChange={e => handleSeoChange('slug', e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                      placeholder="slug-artikel"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Lowercase, hyphen, max 120 chars</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                    <textarea
                      value={seoData.metaDescription}
                      onChange={e => handleSeoChange('metaDescription', e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm h-20"
                      placeholder="Meta description untuk hasil pencarian"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Disarankan 130-160 karakter</p>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-3 bg-gray-50 text-sm">
                    <div className="text-[11px] text-gray-500 mb-1">SEO Preview</div>
                    <div className="text-[#1a0dab] text-base leading-snug font-medium">{seoData.seoTitle || formData.title || 'SEO title preview'}</div>
                    <div className="text-[#006621] text-xs mb-1">{`${(SITE_INFO?.url || window.location.origin)}article/${sanitizeSlug(seoData.slug || formData.title || 'preview')}`}</div>
                    <div className="text-gray-600 text-sm leading-snug">{seoData.metaDescription || formData.excerpt || stripHtmlToText(formData.content).slice(0, 160) || 'Meta description preview akan muncul di sini.'}</div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">News: {channel === 'school' ? 'School' : channel === 'student' ? 'Student' : 'All'}</h2>
           <p className="text-gray-500 text-sm">Manage articles, updates and announcements</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-[#5D9CEC] hover:bg-[#4A89DC] gap-2">
          <Plus size={18} /> New Article
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
           <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Search articles..." 
               className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#5D9CEC] outline-none text-sm"
               value={filter}
               onChange={e => setFilter(e.target.value)}
             />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="p-4 w-1/2">Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500">Loading...</td></tr>
              ) : articles.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500">No articles yet</td></tr>
              ) : (
                articles
                  .filter(a => a.title.toLowerCase().includes(filter.toLowerCase()))
                  .map(article => (
                  <tr key={article.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-gray-800 mb-1">{article.title}</div>
                      <div className="text-xs text-gray-500 flex gap-2">
                         {article.category && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{article.category}</span>}
                         {article.tags && article.tags.length > 0 && <span>• {article.tags.join(', ')}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          {article.author_name?.charAt(0) || 'A'}
                        </div>
                        <span className="text-gray-600">{article.author_name}</span>
                      </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      article.status === 'published' ? 'bg-green-100 text-green-700' :
                      article.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID') : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(article)}
                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg" title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      {(user.role === 'Admin' || user.role === 'Superadmin') && (
                        <button 
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {articles.length === 0 && (
          <div className="p-12 text-center text-gray-400 bg-gray-50/50">
             <FileText size={48} className="mx-auto mb-4 opacity-20" />
             <p>No articles found in this channel.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsManager;