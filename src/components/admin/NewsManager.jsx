import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Edit, Trash2, Save, X,
  FileText, Tag, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import RichTextEditor from "./RichTextEditor";
import { validateImageFile } from "@/lib/api-utils";
import { listArticles, createArticle, updateArticle, deleteArticle } from "@/lib/articlesApi";

const NewsManager = ({ user, channel }) => {
  const { toast } = useToast();
  const [view, setView] = useState("list");
  const [articles, setArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [filter, setFilter] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const featuredImageInputRef = React.useRef(null);
  const featuredImageFileRef = React.useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    status: "draft",
    featuredImage: "",
    featuredImageAlt: "",
    featuredImageName: ""
  });

  const [seoData, setSeoData] = useState({
    seoTitle: "",
    slug: "",
    metaDescription: ""
  });

  const stripHtmlToText = (html) => html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

  const sanitizeSlug = (input) => {
    if (!input) return "";
    const cleaned = input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .join("-")
      .replace(/-+/g, "-");
    return cleaned.slice(0, 120).replace(/(^-|-$)+/g, "") || "artikel";
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await listArticles({ status: "all", limit: 100 });
      setArticles(data.items || []);
    } catch (e) {
      console.error("[NewsManager] Load failed:", e);
      toast({ variant: "destructive", title: "Load failed", description: e.message });
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
      toast({ variant: "destructive", title: "File invalid", description: validation.error });
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
      toast({ title: "Image ready", description: "Featured image ready to upload" });
    } catch (err) {
      console.error("[NewsManager] Image prep failed:", err);
      toast({ variant: "destructive", title: "Image prep failed", description: err.message });
    } finally {
      setUploadingImage(false);
      if (featuredImageInputRef.current) featuredImageInputRef.current.value = "";
    }
  };

  const handleCreateNew = () => {
    setCurrentArticle(null);
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      category: "",
      tags: [],
      status: "draft",
      featuredImage: "",
      featuredImageAlt: "",
      featuredImageName: ""
    });
    setSeoData({
      seoTitle: "",
      slug: "",
      metaDescription: ""
    });
    setView("editor");
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({ variant: "destructive", title: "Error", description: "Title and content required" });
      return;
    }

    try {
      const slug = sanitizeSlug(seoData.slug || formData.title);
      
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
        toast({ title: "Article updated" });
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
        toast({ title: "Article created" });
      }
      
      setView("list");
      featuredImageFileRef.current = null;
      await loadArticles();
    } catch (err) {
      console.error("[NewsManager] Save failed:", err);
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    }
  };

  const handleEdit = (article) => {
    setCurrentArticle(article);
    setFormData({
      title: article.title,
      content: article.content_html || "",
      excerpt: article.excerpt || "",
      category: article.category || "",
      tags: Array.isArray(article.tags) ? article.tags : (article.tags_json ? JSON.parse(article.tags_json) : []),
      status: article.status,
      featuredImage: article.featured_image_url || "",
      featuredImageAlt: article.featured_image_alt || "",
      featuredImageName: article.featured_image || ""
    });
    setSeoData({
      seoTitle: article.seo_title || "",
      slug: article.slug,
      metaDescription: article.seo_description || ""
    });
    setView("editor");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      await deleteArticle(id);
      toast({ title: "Article deleted" });
      await loadArticles();
    } catch (err) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message });
    }
  };

  if (view === "editor") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center sticky top-0 z-10 bg-gray-50/95 backdrop-blur py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {currentArticle ? "Edit Article" : "New Article"}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView("list")}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#5D9CEC] hover:bg-[#4A89DC] gap-2">
              <Save size={18} /> {formData.status === "published" ? "Update & Publish" : "Save Draft"}
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
                    {(user.role === "Admin" || user.role === "Superadmin") && (
                      <option value="published">Published</option>
                    )}
                  </select>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Author: <span className="font-medium text-gray-800">{currentArticle?.author_name || user.name}</span></p>
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
                      onClick={() => setFormData({...formData, featuredImage: ""})}
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
                  {uploadingImage ? "Uploading..." : (formData.featuredImage ? "Change Image" : "Upload Image")}
                </Button>
                <p className="text-xs text-gray-500">JPG, PNG, WebP • Max 4MB</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Tag size={18} className="text-[#5D9CEC]" /> Metadata
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    <option value="">Select category</option>
                    <option value="Berita">News</option>
                    <option value="Prestasi">Achievement</option>
                    <option value="Kegiatan">Activity</option>
                    <option value="Pengumuman">Announcement</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={seoData.seoTitle}
                    onChange={e => setSeoData({...seoData, seoTitle: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="SEO title (60 chars)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                  <input
                    type="text"
                    value={seoData.slug}
                    onChange={e => setSeoData({...seoData, slug: sanitizeSlug(e.target.value)})}
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="article-slug"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                  <textarea
                    value={seoData.metaDescription}
                    onChange={e => setSeoData({...seoData, metaDescription: e.target.value.slice(0, 160)})}
                    className="w-full p-2 border rounded-lg text-sm h-16"
                    placeholder="Meta description (160 chars max)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">News & Articles</h2>
           <p className="text-gray-500 text-sm">Manage all articles, updates and announcements</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-[#5D9CEC] hover:bg-[#4A89DC] gap-2">
          <Plus size={18} /> New Article
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                      <div className="text-xs text-gray-500">
                         {article.category && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{article.category}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{article.author_name || "Unknown"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        article.status === "published" ? "bg-green-100 text-green-700" :
                        article.status === "pending" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {article.created_at ? new Date(article.created_at).toLocaleDateString("en-US") : "N/A"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(article)}
                          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        {(user.role === "Admin" || user.role === "Superadmin") && (
                          <button 
                            onClick={() => handleDelete(article.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
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
          <div className="p-12 text-center text-gray-400">
             <FileText size={48} className="mx-auto mb-4 opacity-20" />
             <p>No articles found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsManager;
