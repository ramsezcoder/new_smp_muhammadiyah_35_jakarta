import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Pencil, GripVertical, Youtube, Video as VideoIcon, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/db';

const VideoManager = ({ user }) => {
  const { toast } = useToast();
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ id: null, title: '', description: '', videoType: 'youtube', url: '', thumbnail: '', category: '' });
  const dragIndex = useRef(null);
  const dragOver = useRef(null);

  const isSuperadmin = user?.role === 'Superadmin';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/videos');
        const json = await res.json();
        setVideos(json.items || []);
      } catch (e) {
        toast({ variant: 'destructive', title: 'Gagal memuat video', description: e.message });
      }
    };
    load();
  }, []);

  const extractYouTubeId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getYouTubeThumbnail = (videoId) => `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const resetForm = () => {
    setForm({ id: null, title: '', description: '', videoType: 'youtube', url: '', thumbnail: '', category: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) {
      toast({ variant: 'destructive', title: 'Lengkapi data', description: 'Judul dan URL wajib diisi' });
      return;
    }

    let finalUrl = form.url.trim();
    let finalThumbnail = form.thumbnail;

    if (form.videoType === 'youtube') {
      const videoId = extractYouTubeId(form.url);
      if (!videoId) {
        toast({ variant: 'destructive', title: 'URL tidak valid', description: 'URL YouTube tidak valid' });
        return;
      }
      finalUrl = `https://www.youtube.com/embed/${videoId}`;
      finalThumbnail = getYouTubeThumbnail(videoId);
    }

    try {
      const res = await fetch('/api/videos/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': 'SuperAdmin@2025' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          videoType: form.videoType,
          url: finalUrl,
          thumbnail: finalThumbnail,
          category: form.category.trim() || 'Umum',
        })
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || 'Gagal menyimpan');
      const r = await fetch('/api/videos');
      const j = await r.json();
      setVideos(j.items || []);
      toast({ title: 'Video ditambahkan', description: 'Data video disimpan' });
      resetForm();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Gagal menyimpan', description: err.message });
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title,
      description: item.description || '',
      videoType: item.videoType || 'youtube',
      url: item.url,
      thumbnail: item.thumbnail || '',
      category: item.category || '',
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus video ini?');
    if (!confirmed) return;
    await fetch(`/api/videos/${id}`, { method: 'DELETE', headers: { 'x-admin-token': 'SuperAdmin@2025' } });
    const r = await fetch('/api/videos');
    const j = await r.json();
    setVideos(j.items || []);
    toast({ title: 'Video dihapus', description: 'Data sudah dihapus' });
    if (form.id === id) resetForm();
  };

  const handleDragStart = (idx) => { dragIndex.current = idx; };
  const handleDragEnter = (idx) => { dragOver.current = idx; };
  const handleDragEnd = async () => {
    const from = dragIndex.current;
    const to = dragOver.current;
    dragIndex.current = null;
    dragOver.current = null;
    if (from === null || to === null || from === to) return;
    const reordered = [...videos];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setVideos(reordered);
    const order = reordered.map(v => v.id);
    await fetch('/api/videos/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': 'SuperAdmin@2025' }, body: JSON.stringify({ order }) });
    toast({ title: 'Urutan disimpan', description: 'Urutan video diperbarui' });
  };

  const handleImportDefaults = async () => {
    const confirmed = window.confirm('Import video default? Akan ditambahkan ke daftar yang ada.');
    if (!confirmed) return;
    try {
      const res = await fetch('/api/videos/import-default', { method: 'POST' });
      const r = await fetch('/api/videos');
      const j = await r.json();
      setVideos(j.items || []);
      toast({ title: 'Import berhasil', description: 'Video default ditambahkan' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Import gagal', description: e.message });
    }
  };

  if (!isSuperadmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Access Denied: Only Superadmin can manage videos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Video Gallery Manager</h2>
          <p className="text-gray-600">Tambah, edit, hapus, dan atur urutan video kegiatan sekolah.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImportDefaults}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
          >
            Import Video Default
          </button>
          <button
            onClick={resetForm}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Reset Form
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{form.id ? 'Edit Video' : 'Tambah Video'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Judul Video</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Judul video"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Deskripsi singkat"
                rows="3"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipe Video</label>
              <select
                value={form.videoType}
                onChange={(e) => setForm((prev) => ({ ...prev, videoType: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="youtube">YouTube Embed</option>
                <option value="file">File Upload (Coming Soon)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">URL Video</label>
              <input
                value={form.url}
                onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500">Format: youtube.com/watch?v=... atau youtu.be/...</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Kategori</label>
              <input
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Contoh: Profil Sekolah, Prestasi, dll"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#5D9CEC] text-white py-2.5 rounded-lg font-semibold hover:bg-[#4A89DC] flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {form.id ? 'Simpan Perubahan' : 'Tambah Video'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Daftar Video ({videos.length})</h3>
            <p className="text-xs text-gray-500">Tarik kartu untuk mengubah urutan.</p>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-10 text-gray-500 border border-dashed border-gray-200 rounded-lg">
              Belum ada video. Tambahkan video baru atau import default.
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative border border-gray-200 rounded-lg p-4 flex gap-3 bg-white shadow-sm"
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect fill="%23e5e7eb" width="200" height="120"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="12" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3ENo thumbnail%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <VideoIcon size={24} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      {item.videoType === 'youtube' ? (
                        <Youtube size={20} className="text-white" />
                      ) : (
                        <VideoIcon size={20} className="text-white" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs text-gray-400">#{idx + 1}</p>
                        <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description || 'Tidak ada deskripsi'}</p>
                        {item.category && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <GripVertical size={18} className="text-gray-300 flex-shrink-0" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 flex items-center gap-1"
                      >
                        <ExternalLink size={12} />
                        Lihat
                      </a>
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoManager;
