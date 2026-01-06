# 🚀 Quick Start Guide - Gallery & Staff Management

## For Superadmin Users

### 📸 Upload Gallery Images

1. **Go to:** Admin Dashboard → **Media Library**
2. **Click:** "Klik untuk upload atau tarik file"
3. **Select files:** JPG, PNG, or WebP (max 4MB each)
4. **Done!** Images appear in grid below
5. **View on site:**
   - Homepage gallery section
   - `/gallery/photos` page

---

### ✏️ Rename Gallery Images (for SEO)

1. **In Media Library:** Click any image card
2. **Preview modal opens** showing:
   - Full-size image
   - Current filename
   - Upload date
3. **Type new name** in "Rename for SEO" field
   - Example: "Kegiatan pembelajaran"
   - Auto-converts to: "kegiatan-pembelajaran-1704553200000.webp"
4. **Click "Simpan"** button
5. **Done!** Filename updated, auto-syncs to all pages

---

### 🗑️ Delete Gallery Images

1. **In Media Library:** Click the **trash icon** on any image
2. **Confirmation dialog appears:**
   - "Apakah Anda yakin ingin menghapus foto ini?"
3. **Click OK** to confirm
4. **Done!** Image removed from all pages

---

### 🔄 Reorder Gallery Images

1. **In Media Library:** Drag any image card
2. **Hold & drag** to new position in the grid
3. **Drop** to set new order
4. **Toast notification:** "Urutan disimpan"
5. **Done!** Order updates on homepage & /gallery/photos

---

### 👥 Manage Staff Profiles

**Go to:** Admin Dashboard → **Staff Profile Manager**

#### Add New Staff Member
1. **Fill in form (left side):**
   - Nama: "R. Agung Budi Laksono"
   - Jabatan: "Waka Sarpras"
   - Foto: Click "Pilih Foto" → select JPG/PNG/WebP (4MB max)
   - Aktif: Check the box ✓
2. **Click "Tambah Staff"**
3. **Done!** Staff appears in list on right, and on `/profile/staff` page

#### Edit Staff Member
1. **In staff list (right side):** Click **pencil icon** on any staff card
2. **Form fills** with current data (left side)
3. **Edit any field** (name, position, photo, active status)
4. **Click "Simpan Perubahan"**
5. **Done!** Changes saved and visible on public page

#### Delete Staff Member
1. **In staff list (right side):** Click **trash icon** on any staff card
2. **Confirmation dialog:**
   - "Apakah Anda yakin ingin menghapus data staff ini?"
3. **Click OK** to confirm
4. **Done!** Staff removed from all pages

#### Reorder Staff Members
1. **In staff list (right side):** Drag any staff card
2. **Hold & drag** to new position
3. **Drop** to set order
4. **Toast notification:** "Urutan disimpan"
5. **Done!** Order updates on `/profile/staff` page

#### Hide/Show Staff (Active/Inactive)
1. **In staff list (right side):** Find "Aktif" checkbox at bottom of card
2. **Uncheck** to hide staff from public page
3. **Check** to show staff again
4. **Done!** Changes apply immediately

---

## 📊 Where Data Appears

| Admin Action | Shows On |
|---|---|
| Upload gallery image | Homepage #gallery, /gallery/photos |
| Rename gallery image | Everywhere gallery appears (with new filename) |
| Reorder gallery | Homepage & /gallery/photos (same order) |
| Delete gallery | Removed from all gallery views |
| Add staff member | /profile/staff page |
| Edit staff (name/position) | /profile/staff page (updated) |
| Reorder staff | /profile/staff page (new order) |
| Deactivate staff | Hidden from /profile/staff page |

---

## ⚠️ Important Notes

- ✅ **All data is saved automatically** (no "Save" button needed in most cases)
- ✅ **No backend database required** - everything stored in browser localStorage
- ✅ **Data persists** across page refreshes and browser restarts
- ✅ **Only Superadmin can** upload, rename, delete, or reorder
- ✅ **Uploads limited to** 4MB per image (JPG, PNG, WebP only)
- ✅ **Drag-drop works** on desktop & tablet (touch-friendly)

---

## 🔍 Troubleshooting

### Image won't upload
- Check file format (JPG, PNG, or WebP only)
- Check file size (must be under 4MB)
- Try refreshing browser and uploading again

### Changes not showing on public page
- Refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check that image/staff is marked "Aktif" (active)
- Make sure you saved changes (click Simpan button)

### Can't access Staff Profile Manager
- You must be logged in as **Superadmin**
- Check your user role (Profile → User Info)

### Image fails to load in admin preview
- This is normal for some images—rename and they'll work fine
- Fallback placeholder shows as backup

---

## 💡 Pro Tips

1. **Batch uploads:** Select multiple images at once to upload faster
2. **SEO filenames:** Use descriptive names like "kegiatan-olahraga-2026" for better search
3. **Photo prep:** Resize images before uploading (smaller file = faster load)
4. **Staff photos:** Use professional headshots, square aspect ratio works best
5. **Inactive staff:** Don't delete—just toggle inactive to keep records

---

## 📱 Responsive & Mobile-Friendly

✅ Works on desktop, tablet, and mobile  
✅ Touch-friendly drag-drop on tablets  
✅ Responsive image grids  
✅ Mobile-optimized forms  

---

## 🆘 Need Help?

**For technical questions:**
- Check the full documentation: `GALLERY_STAFF_FEATURES.md`
- Review the implementation summary: `IMPLEMENTATION_SUMMARY.md`

**For bugs or issues:**
- Note exact steps to reproduce
- Screenshot the error message
- Contact development team with details

---

**Last Updated:** January 6, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
