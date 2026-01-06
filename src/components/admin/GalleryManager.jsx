import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Image, Loader, Pencil, GripVertical, Eye, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/db';
import { listGallery, uploadGallery, deleteGallery, reorderGallery, updateGalleryMeta } from '@/lib/galleryApi';
import { MESSAGES } from '@/config/staticMode';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 4 * 1024 * 1024;

const GalleryManager = ({ user }) => {
  const { toast } = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [seoFields, setSeoFields] = useState({ altText: '' });
  const fileInputRef = useRef(null);
  const dragIndex = useRef(null);
  const dragOver = useRef(null);

  const isSuperadmin = user?.role === 'Superadmin';

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listGallery({ includeUnpublished: true, limit: 200 });
        const items = (data.items || []).map((it) => ({
          id: it.id,
          filename: it.filename,
          name: it.title,
          altText: it.alt_text || '',
          url: it.url,
          is_published: it.is_published,
          sort_order: it.sort_order,
        }));
        setImages(items);
      } catch (e) {
        console.error('[GalleryManager] Load failed:', e);
        toast({ variant: 'destructive', title: 'Gagal memuat galeri', description: e.message });
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleImportDefaults = () => {
    // No longer needed with PHP backend
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);

    try {
      let added = 0;
      for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast({ variant: 'destructive', title: 'Format tidak didukung', description: 'Gunakan JPG, PNG, atau WebP' });
          continue;
        }
        if (file.size > MAX_SIZE) {
          toast({ variant: 'destructive', title: 'File terlalu besar', description: 'Maksimal 4MB per gambar' });
          continue;
        }

        const baseName = file.name.replace(/\.[^.]+$/, '');
        await uploadGallery({ file, title: baseName, alt: baseName });
        added += 1;
      }

      const data = await listGallery({ includeUnpublished: true, limit: 200 });
      const items = (data.items || []).map((it) => ({
        id: it.id,
        filename: it.filename,
        name: it.title,
        altText: it.alt_text || '',
        url: it.url,
        is_published: it.is_published,
        sort_order: it.sort_order,
      }));
      setImages(items);
      
      if (added) toast({ title: 'Upload berhasil', description: `${added} gambar disimpan` });
    } catch (err) {
      console.error('[GalleryManager] Upload failed:', err);
      toast({ variant: 'destructive', title: 'Upload gagal', description: err.message || MESSAGES.OPERATION_FAILED });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId) => {
    const target = images.find((img) => img.id === imageId);
    if (!target) return;
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus foto ini?');
    if (!confirmed) return;
    
    try {
      await deleteGallery(imageId);
      const data = await listGallery({ includeUnpublished: true, limit: 200 });
      const items = (data.items || []).map((it) => ({
        id: it.id,
        filename: it.filename,
        name: it.title,
        altText: it.alt_text || '',
        url: it.url,
        is_published: it.is_published,
        sort_order: it.sort_order,
      }));
      setImages(items);
      
      if (modalImage?.id === imageId) setModalImage(null);
      toast({ title: 'Foto dihapus', description: 'Gambar sudah dihapus dari galeri' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Hapus gagal', description: e.message });
    }
  };

  const handleRename = async () => {
    if (!modalImage || !renameValue.trim()) return;
    
    try {
      await updateGalleryMeta({
        id: modalImage.id,
        title: renameValue.trim(),
        alt_text: seoFields.altText.trim() || `${renameValue.trim()} SMP Muhammadiyah 35 Jakarta`,
      });
      
      const data = await listGallery({ includeUnpublished: true, limit: 200 });
      const items = (data.items || []).map((it) => ({
        id: it.id,
        filename: it.filename,
        name: it.title,
        altText: it.alt_text || '',
        url: it.url,
        is_published: it.is_published,
        sort_order: it.sort_order,
      }));
      setImages(items);
      const updatedModal = items.find(img => img.id === modalImage.id);
      setModalImage(updatedModal || null);
      
      toast({ title: 'Data diperbarui', description: 'Nama dan SEO fields telah disimpan' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update gagal', description: e.message });
    }
  };

  const handlePublish = async () => {
    try {
      const unpublished = images.filter(i => !i.is_published);
      for (const img of unpublished) {
        await updateGalleryMeta({ id: img.id, title: img.name, alt_text: img.altText, is_published: 1 });
      }
      const data = await listGallery({ includeUnpublished: true, limit: 200 });
      const items = (data.items || []).map((it) => ({
        id: it.id,
        filename: it.filename,
        name: it.title,
        altText: it.alt_text || '',
        url: it.url,
        is_published: it.is_published,
        sort_order: it.sort_order,
      }));
      setImages(items);
      toast({ title: 'Publish Galeri', description: MESSAGES.PUBLISH_SUCCESS });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Publish gagal', description: e.message });
    }
  };

  const handleDragStart = (idx) => { dragIndex.current = idx; };
  const handleDragEnter = (idx) => { dragOver.current = idx; };
  const handleDragEnd = async () => {
    const from = dragIndex.current;
    const to = dragOver.current;
    dragIndex.current = null;
    dragOver.current = null;
    if (from === null || to === null || from === to) return;
    
    const reordered = [...images];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setImages(reordered);
    
    try {
      const order = reordered.map(i => i.id);
      await reorderGallery(order);
      toast({ title: 'Urutan disimpan', description: 'Urutan galeri diperbarui' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Reorder gagal', description: e.message });
      const data = await listGallery({ includeUnpublished: true, limit: 200 });
      const items = (data.items || []).map((it) => ({
        id: it.id,
        filename: it.filename,
        name: it.title,
        altText: it.alt_text || '',
        url: it.url,
        is_published: it.is_published,
        sort_order: it.sort_order,
      }));
      setImages(items);
    }
  };

  const openModal = (img) => {
    setModalImage(img);
    setRenameValue(img.name || db.formatName(img.filename) || '');
    setSeoFields({
      altText: img.altText || ''
    });
  };

  if (!isSuperadmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Access Denied: Only Superadmin can manage gallery</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Gallery Manager</h2>
          <p className="text-gray-600">Upload, rename, urutkan, dan kelola galeri foto sekolah.</p>
        </div>
        <button
          onClick={handlePublish}
          className="px-4 py-2 text-sm bg-[#5D9CEC] hover:bg-[#4A89DC] text-white rounded-lg font-medium transition-colors"
        >
          Publish Galeri
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border-2 border-dashed border-[#5D9CEC] p-8 text-center hover:bg-blue-50 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center gap-3 mx-auto"
        >
          {uploading ? (
            <>
              <Loader size={40} className="text-[#5D9CEC] animate-spin" />
              <p className="font-semibold text-gray-700">Mengunggah...</p>
            </>
          ) : (
            <>
              <Upload size={40} className="text-[#5D9CEC]" />
              <div>
                <p className="font-semibold text-gray-700">Klik untuk upload atau tarik file</p>
                <p className="text-sm text-gray-500">JPG, PNG, WebP • Maks 4MB</p>
              </div>
            </>
          )}
        </button>
      </motion.div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {images.length === 0 ? 'Belum ada gambar' : `${images.length} gambar dalam galeri`}
          </h3>
          <p className="text-xs text-gray-500">Tip: tarik kartu untuk mengubah urutan</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <Loader size={32} className="mx-auto animate-spin mb-2" />
            Memuat galeri...
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Image size={48} className="mx-auto mb-3 opacity-20" />
            <p>Belum ada gambar. Unggah untuk memulai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square border border-gray-100"
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
              >
                <img
                  src={img.url}
                  alt={img.name || img.filename}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage not found%3C/text%3E%3C/svg%3E';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-2 left-2 flex items-center gap-2 text-white text-xs">
                  <GripVertical size={16} className="opacity-80" />
                  <span>#{idx + 1}</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs space-y-1">
                  <p className="font-semibold truncate">{db.formatName(img.name || img.filename || 'Foto')}</p>
                  <p className="text-white/70 truncate text-[10px]">{img.filename}</p>
                </div>

                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openModal(img)}
                    className="bg-white text-gray-800 rounded-full p-2 hover:bg-blue-50 shadow"
                    aria-label="Preview"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 shadow"
                    aria-label="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-sm text-gray-700">
        <p className="font-semibold mb-2">📋 Upload Guidelines:</p>
        <ul className="space-y-1 text-xs">
          <li>✓ Format: JPG, PNG, WebP</li>
          <li>✓ Maksimal ukuran 4 MB per gambar</li>
          <li>✓ Nama file akan diubah ke format SEO otomatis</li>
          <li>✓ Hanya Superadmin yang dapat upload/rename/delete/reorder</li>
          <li>✓ Tarik kartu untuk mengubah urutan tampilan</li>
        </ul>
      </div>

      <AnimatePresence>
        {modalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4"
            onClick={() => setModalImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={modalImage.url}
                  alt={modalImage.name}
                  className="w-full max-h-[55vh] object-contain bg-gray-50"
                />
                <button
                  onClick={() => setModalImage(null)}
                  className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-2 hover:bg-black"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Filename</p>
                    <p className="font-semibold text-gray-800 break-all">{modalImage.filename}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Upload date</p>
                    <p className="font-medium text-gray-800">{new Date(modalImage.uploadedAt || Date.now()).toLocaleString('id-ID')}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Nama Foto (Display Name)</label>
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Masukkan nama foto"
                  />
                  <p className="text-xs text-gray-500">Format filename otomatis: slugified-title-timestamp.webp</p>
                </div>



                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Alt Text (SEO)</label>
                  <input
                    value={seoFields.altText}
                    onChange={(e) => setSeoFields(prev => ({ ...prev, altText: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Deskripsi gambar untuk SEO"
                  />
                  <p className="text-xs text-gray-500">Digunakan untuk atribut alt pada HTML</p>
                </div>



                <div className="flex items-center justify-between pt-2 gap-3">
                  <button
                    onClick={handleRename}
                    className="px-6 py-2.5 bg-[#5D9CEC] text-white rounded-lg hover:bg-[#4A89DC] flex items-center gap-2 font-medium"
                  >
                    <Pencil size={16} />
                    Simpan Perubahan
                  </button>
                  <button
                    onClick={() => handleDeleteImage(modalImage.id)}
                    className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Hapus Foto
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryManager;
