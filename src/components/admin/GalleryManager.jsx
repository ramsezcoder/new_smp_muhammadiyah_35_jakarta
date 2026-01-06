import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, Image, Loader } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { MESSAGES } from '@/config/staticMode';

const GalleryManager = ({ user }) => {
  const { toast } = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Only superadmin can access
  const isSuperadmin = user?.role === 'Superadmin';

  if (!isSuperadmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Access Denied: Only Superadmin can manage gallery</p>
      </div>
    );
  }

  // Load images from /public/uploads/gallery/
  const loadGalleryImages = async () => {
    try {
      setLoading(true);
      // Simulate loading gallery images
      // In production, you'd fetch from API endpoint listing all gallery images
      const response = await fetch('/uploads/gallery/').catch(() => null);
      // For now, we'll show uploaded images from localStorage or API
      const savedImages = JSON.parse(localStorage.getItem('gallery_uploads') || '[]');
      setImages(savedImages);
    } catch (err) {
      console.warn('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedFiles = [];

    for (const file of files) {
      try {
        // Try to upload to API first (with timeout)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('adminToken', 'SuperAdmin@2025');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        let uploadedFile = null;
        
        try {
          const response = await fetch('/api/upload/gallery', {
            method: 'POST',
            headers: { 'x-admin-token': 'SuperAdmin@2025' },
            body: formData,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const { data } = await response.json();
            uploadedFile = data;
          }
        } catch (apiErr) {
          clearTimeout(timeoutId);
          console.warn('[gallery] API upload failed, using static mode', apiErr);
        }

        // If API failed, save as base64 in localStorage
        if (!uploadedFile) {
          const reader = new FileReader();
          reader.onload = (event) => {
            uploadedFile = {
              id: Date.now(),
              filename: file.name,
              name: file.name,
              originalUrl: event.target.result,
              dataUrl: event.target.result,
              size: file.size,
              uploadedAt: new Date().toISOString()
            };
            uploadedFiles.push(uploadedFile);
            
            // Save to localStorage
            const newImages = [...images, uploadedFile];
            setImages(newImages);
            localStorage.setItem('gallery_uploads', JSON.stringify(newImages));
            
            toast({
              title: 'Upload Successful',
              description: `${file.name} saved to local storage (static mode)`
            });
          };
          reader.readAsDataURL(file);
          continue;
        }

        uploadedFiles.push(uploadedFile);

        toast({
          title: 'Upload Successful',
          description: `${file.name} uploaded successfully`
        });
      } catch (err) {
        toast({
          title: 'Upload Failed',
          description: err.message || 'Failed to upload file',
          variant: 'destructive'
        });
      }
    }

    // Update images state with API-uploaded files
    if (uploadedFiles.length > 0) {
      const newImages = [...images, ...uploadedFiles];
      setImages(newImages);
      localStorage.setItem('gallery_uploads', JSON.stringify(newImages));
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteImage = (imageId) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    // Remove from state
    const updated = images.filter(img => img.id !== imageId);
    setImages(updated);
    localStorage.setItem('gallery_uploads', JSON.stringify(updated));

    toast({
      title: 'Deleted',
      description: 'Image removed from gallery'
    });

    // In production, call DELETE /api/upload/gallery/:id
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Gallery Manager</h2>
        <p className="text-gray-600">Upload and manage school gallery images. Only superadmin access.</p>
      </div>

      {/* Upload Section */}
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
              <p className="font-semibold text-gray-700">Uploading...</p>
            </>
          ) : (
            <>
              <Upload size={40} className="text-[#5D9CEC]" />
              <div>
                <p className="font-semibold text-gray-700">Click to upload or drag files</p>
                <p className="text-sm text-gray-500">PNG, JPG, WebP up to 4MB</p>
              </div>
            </>
          )}
        </button>
      </motion.div>

      {/* Image Grid */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {images.length === 0 ? 'No images yet' : `${images.length} images in gallery`}
        </h3>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <Loader size={32} className="mx-auto animate-spin mb-2" />
            Loading gallery...
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Image size={48} className="mx-auto mb-3 opacity-20" />
            <p>No images uploaded yet. Upload some images to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <motion.div
                key={img.filename}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square"
              >
                <img
                  src={img.dataUrl || img.originalUrl || img.url}
                  alt={img.filename || img.name}
                  onError={(e) => {
                    console.warn('[gallery] image failed to load:', img.filename);
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage not found%3C/text%3E%3C/svg%3E';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                >
                  <div className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors">
                    <Trash2 size={20} />
                  </div>
                </button>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 group-hover:translate-y-0 translate-y-full transition-transform duration-300">
                  <p className="text-white text-xs truncate">{img.filename || img.name}</p>
                  <p className="text-gray-300 text-xs">{(img.size / 1024).toFixed(0)} KB</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-sm text-gray-700">
        <p className="font-semibold mb-2">📋 Upload Guidelines:</p>
        <ul className="space-y-1 text-xs">
          <li>✓ Accepted formats: JPG, PNG, WebP</li>
          <li>✓ Maximum file size: 4 MB per image</li>
          <li>✓ Images are automatically optimized to WebP format</li>
          <li>✓ Only Superadmin can upload and delete images</li>
          <li>✓ Use high-quality images for best results</li>
        </ul>
      </div>
    </div>
  );
};

export default GalleryManager;
