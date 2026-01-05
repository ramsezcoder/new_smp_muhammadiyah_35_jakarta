import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const RegistrationModal = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    namaLengkap: '',
    tanggalLahir: '',
    orangTua: '',
    nomorWA: '',
    email: '',
    program: '',
    gelombang: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission - In production, save to Supabase
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Store in localStorage for now
      const registrants = JSON.parse(localStorage.getItem('ppdb_registrants') || '[]');
      registrants.push({
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('ppdb_registrants', JSON.stringify(registrants));

      toast({
        title: "Pendaftaran Berhasil! 🎉",
        description: "Data Anda telah kami terima. Silakan lanjutkan ke pembayaran.",
      });
    }, 2000);
  };

  const handleWhatsApp = () => {
    const message = `Assalamu'alaikum, saya ${formData.namaLengkap} ingin mendaftar PPDB SMP Muhammadiyah 35 Jakarta TA 2026/2027. Program: ${formData.program}, Gelombang: ${formData.gelombang}`;
    const whatsappUrl = `https://wa.me/6282112345678?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const resetForm = () => {
    setFormData({
      namaLengkap: '',
      tanggalLahir: '',
      orangTua: '',
      nomorWA: '',
      email: '',
      program: '',
      gelombang: '',
      message: ''
    });
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {!isSuccess ? (
            <>
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Formulir Pendaftaran PPDB</h2>
                  <p className="text-blue-100 text-sm">TA 2026/2027</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    name="namaLengkap"
                    value={formData.namaLengkap}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    name="tanggalLahir"
                    value={formData.tanggalLahir}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nama Orang Tua/Wali *
                  </label>
                  <input
                    type="text"
                    name="orangTua"
                    value={formData.orangTua}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama orang tua/wali"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="nomorWA"
                    value={formData.nomorWA}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Pilihan Program *
                  </label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih Program</option>
                    <option value="reguler">Reguler</option>
                    <option value="tahfidz">Tahfidz</option>
                    <option value="international">International Class</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Gelombang Pendaftaran *
                  </label>
                  <select
                    name="gelombang"
                    value={formData.gelombang}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih Gelombang</option>
                    <option value="gelombang-1">Gelombang 1 (Nov - Jan)</option>
                    <option value="gelombang-2">Gelombang 2 (Feb - Apr)</option>
                    <option value="gelombang-3">Gelombang 3 (Mei - Jul)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Pesan/Catatan (Opsional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan pesan atau pertanyaan Anda..."
                  ></textarea>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Upload className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold mb-1">Dokumen yang perlu disiapkan:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Fotocopy KTP Orang Tua/Wali</li>
                        <li>Fotocopy Kartu Keluarga</li>
                        <li>Pas Foto 3x4 (3 lembar)</li>
                        <li>Fotocopy Ijazah SD/MI (setelah lulus)</li>
                      </ul>
                      <p className="mt-2 text-xs text-blue-700">* Dokumen dapat diunggah setelah konfirmasi pendaftaran via WhatsApp</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Mengirim Data...' : 'Daftar Sekarang'}
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-16 h-16 text-green-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Pendaftaran Berhasil! 🎉
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Terima kasih {formData.namaLengkap}! Data pendaftaran Anda telah kami terima.
                <br />
                Silakan lanjutkan dengan menghubungi kami via WhatsApp untuk konfirmasi dan pembayaran.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Hubungi via WhatsApp
                </button>

                <button
                  onClick={resetForm}
                  className="w-full bg-gray-200 text-gray-700 px-6 py-4 rounded-lg font-bold hover:bg-gray-300 transition-all duration-300"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RegistrationModal;