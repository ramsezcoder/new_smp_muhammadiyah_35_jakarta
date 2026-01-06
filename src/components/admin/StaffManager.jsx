import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, Pencil, GripVertical, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/db';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 4 * 1024 * 1024;

const StaffManager = ({ user }) => {
  const { toast } = useToast();
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', position: '', photo: '', active: true });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dragIndex = useRef(null);
  const dragOver = useRef(null);

  const isSuperadmin = user?.role === 'Superadmin';

  useEffect(() => {
    setStaff(db.getStaffProfiles());
  }, []);

  const toDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Format tidak didukung', description: 'Gunakan JPG, PNG, atau WebP' });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({ variant: 'destructive', title: 'File terlalu besar', description: 'Maksimal 4MB' });
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await toDataUrl(file);
      setForm((prev) => ({ ...prev, photo: dataUrl }));
    } catch (err) {
      toast({ variant: 'destructive', title: 'Gagal memuat foto', description: err.message || 'Coba lagi' });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({ id: null, name: '', position: '', photo: '', active: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.position.trim()) {
      toast({ variant: 'destructive', title: 'Lengkapi data', description: 'Nama dan jabatan wajib diisi' });
      return;
    }

    db.saveStaffProfile({
      id: form.id,
      name: form.name.trim(),
      position: form.position.trim(),
      photo: form.photo,
      active: form.active,
    }, user?.id);

    setStaff(db.getStaffProfiles());
    toast({ title: form.id ? 'Profil diperbarui' : 'Profil ditambahkan', description: 'Data staff disimpan' });
    resetForm();
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      name: item.name,
      position: item.position || item.role || '',
      photo: item.photo || item.image || '',
      active: item.active !== false,
    });
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus data staff ini?');
    if (!confirmed) return;
    db.deleteStaffProfile(id, user?.id);
    setStaff(db.getStaffProfiles());
    toast({ title: 'Staff dihapus', description: 'Data sudah dihapus' });
    if (form.id === id) resetForm();
  };

  const handleToggleActive = (id) => {
    const current = staff.find((s) => s.id === id);
    if (!current) return;
    db.saveStaffProfile({ ...current, active: !current.active }, user?.id);
    setStaff(db.getStaffProfiles());
  };

  const handleDragStart = (idx) => { dragIndex.current = idx; };
  const handleDragEnter = (idx) => { dragOver.current = idx; };
  const handleDragEnd = () => {
    const from = dragIndex.current;
    const to = dragOver.current;
    dragIndex.current = null;
    dragOver.current = null;
    if (from === null || to === null || from === to) return;
    const reordered = [...staff];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const normalized = db.reorderStaffProfiles(reordered, user?.id);
    setStaff(normalized);
    toast({ title: 'Urutan disimpan', description: 'Urutan staff diperbarui' });
  };

  if (!isSuperadmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Access Denied: Only Superadmin can manage staff profiles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Staff Profile Manager</h2>
          <p className="text-gray-600">Tambah, edit, hapus, dan atur urutan guru & karyawan.</p>
        </div>
        <button
          onClick={resetForm}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset Form
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{form.id ? 'Edit Staff' : 'Tambah Staff'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nama</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Nama lengkap"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Jabatan</label>
              <input
                value={form.position}
                onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Contoh: Guru Matematika"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Foto</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                  {form.photo ? (
                    <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    disabled={uploading}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Pilih Foto
                  </button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP • Maks 4MB</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Aktif ditampilkan</span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#5D9CEC] text-white py-2.5 rounded-lg font-semibold hover:bg-[#4A89DC] disabled:opacity-70"
              disabled={uploading}
            >
              {form.id ? 'Simpan Perubahan' : 'Tambah Staff'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Daftar Staff ({staff.length})</h3>
            <p className="text-xs text-gray-500">Tarik kartu untuk mengubah urutan.</p>
          </div>

          {staff.length === 0 ? (
            <div className="text-center py-10 text-gray-500 border border-dashed border-gray-200 rounded-lg">
              Belum ada data staff. Tambahkan staff baru.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff.map((item, idx) => (
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
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.photo || item.image || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Urutan #{idx + 1}</p>
                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-600 truncate">{item.position || item.role}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      {item.active !== false ? (
                        <CheckCircle2 size={14} className="text-green-600" />
                      ) : (
                        <XCircle size={14} className="text-gray-400" />
                      )}
                      <span>{item.active !== false ? 'Aktif' : 'Nonaktif'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end justify-between">
                    <GripVertical size={18} className="text-gray-300" />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2 py-1 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={item.active !== false}
                        onChange={() => handleToggleActive(item.id)}
                      />
                      Aktif
                    </label>
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

export default StaffManager;
