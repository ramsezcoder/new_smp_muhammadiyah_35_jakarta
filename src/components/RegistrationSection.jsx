import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SITE_INFO, PPDB_FAQS, getFAQSchema, getBreadcrumbSchema } from '@/lib/seo-utils';
import { sanitizeInput, sanitizePhone, isValidPhone } from '@/utils/sanitize';
import { getRecaptchaToken, verifyRecaptchaToken } from '@/lib/recaptcha';

const RegistrationSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    namaLengkap: '',
    asalSekolah: '',
    tanggalLahir: '',
    orangTua: '',
    nomorWA: '',
    jenisRegistrasi: 'CPMB',
  });
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitAt, setLastSubmitAt] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Security: sanitize all user input before storing in state
    if (name === 'nomorWA') {
      const cleanPhone = sanitizePhone(value);
      setFormData({ ...formData, [name]: cleanPhone });
      return;
    }
    if (name === 'tanggalLahir') {
      setFormData({ ...formData, [name]: value });
      return;
    }
    setFormData({ ...formData, [name]: sanitizeInput(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot: silently ignore bots
    if (honeypot && honeypot.trim() !== '') return;

    // Basic rate limit: block repeated submissions within 60s
    const now = Date.now();
    if (now - lastSubmitAt < 60000) {
      toast({ title: "Tunggu sebentar", description: "Mohon coba lagi dalam 1 menit." });
      return;
    }

    if (!isValidPhone(formData.nomorWA)) {
      toast({ title: "Nomor WA tidak valid", description: "Gunakan 10-15 digit angka." });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getRecaptchaToken('registration_submit');
      if (!token) {
        toast({ title: "Verifikasi gagal", description: "Tidak dapat memuat reCAPTCHA. Coba lagi." });
        setIsSubmitting(false);
        return;
      }

      const verification = await verifyRecaptchaToken(token);
      if (!verification?.success || (typeof verification.score === 'number' && verification.score < 0.5)) {
        console.warn('Suspicious registration blocked', {
          score: verification?.score,
          action: verification?.action,
        });
        toast({ title: "Verifikasi reCAPTCHA gagal", description: "Silakan coba lagi." });
        setLastSubmitAt(now); // soft throttle on failed verification
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.warn('reCAPTCHA verification error', err);
      toast({ title: "Verifikasi gagal", description: "Koneksi verifikasi bermasalah. Coba lagi." });
      setIsSubmitting(false);
      return;
    }
    
    // Save to localStorage with proper timestamp
    const registrants = JSON.parse(localStorage.getItem('registrants') || '[]');
    const newRegistrant = {
      ...formData,
      id: Date.now(),
      status: 'new',
      createdAt: new Date().toISOString(),
      registeredAt: Date.now()
    };
    registrants.push(newRegistrant);
    localStorage.setItem('registrants', JSON.stringify(registrants));

    setIsSuccess(true);
    setLastSubmitAt(now);
    setIsSubmitting(false);
    toast({
      title: "Pendaftaran Berhasil!",
      description: "Silakan lanjutkan konfirmasi via WhatsApp.",
    });
  };

  const handleWhatsApp = () => {
    const message = `Assalamu'alaikum, saya ${formData.namaLengkap} ingin konfirmasi pendaftaran PPDB.`;
    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="registration" className="py-12 md:py-24 bg-[#E8F4F8] relative overflow-hidden">
      {/* SEO - FAQ Structured Data */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(getFAQSchema(PPDB_FAQS))}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbSchema([
            { name: 'Home', url: SITE_INFO.url },
            { name: 'PPDB', url: `${SITE_INFO.url}#registration` }
          ]))}
        </script>
      </Helmet>

      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4E8F0] rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-center">
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-poppins text-2xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
                Bergabunglah Menjadi Bagian dari <span className="text-[#5D9CEC]">Generasi Unggul</span>
              </h2>
              <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                Isi formulir pendaftaran di samping untuk memulai langkah awal pendidikan berkualitas putra-putri Anda di SMP Muhammadiyah 35 Jakarta.
              </p>
              
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-blue-50 mb-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm md:text-base">
                  <CheckCircle2 className="w-5 h-5 text-[#5D9CEC]" />
                  Alur Pendaftaran
                </h3>
                <ol className="relative border-l border-gray-200 ml-2 space-y-5 md:space-y-6">
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-[#E8F4F8] rounded-full -left-3 ring-4 ring-white text-[10px] md:text-xs font-bold text-[#5D9CEC]">1</span>
                    <h4 className="font-semibold text-gray-800 text-sm md:text-base">Isi Formulir</h4>
                    <p className="text-xs md:text-sm text-gray-500">Lengkapi data diri calon siswa</p>
                  </li>
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-[#E8F4F8] rounded-full -left-3 ring-4 ring-white text-[10px] md:text-xs font-bold text-[#5D9CEC]">2</span>
                    <h4 className="font-semibold text-gray-800 text-sm md:text-base">Konfirmasi WA</h4>
                    <p className="text-xs md:text-sm text-gray-500">Kirim bukti pendaftaran ke admin</p>
                  </li>
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-[#E8F4F8] rounded-full -left-3 ring-4 ring-white text-[10px] md:text-xs font-bold text-[#5D9CEC]">3</span>
                    <h4 className="font-semibold text-gray-800 text-sm md:text-base">Pembayaran & Tes</h4>
                    <p className="text-xs md:text-sm text-gray-500">Lakukan pembayaran dan ikuti tes seleksi</p>
                  </li>
                </ol>
              </div>
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl md:rounded-[2rem] shadow-xl p-6 md:p-8 border border-blue-50"
            >
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <h3 className="font-poppins text-xl md:text-2xl font-bold text-gray-800 text-center mb-4 md:mb-6">Formulir Pendaftaran</h3>
                  {/* Honeypot field for spam mitigation */}
                  <input
                    type="text"
                    name="_honey"
                    value={honeypot}
                    onChange={e => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex="-1"
                    autoComplete="off"
                  />
                  
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Nama Lengkap Siswa</label>
                    <input
                      type="text"
                      name="namaLengkap"
                      required
                      value={formData.namaLengkap}
                      onChange={handleChange}
                      maxLength={100}
                      className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-gray-200 focus:border-[#5D9CEC] focus:ring-2 focus:ring-[#5D9CEC]/20 outline-none transition-all bg-gray-50 focus:bg-white text-sm md:text-base"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Asal Sekolah</label>
                    <input
                      type="text"
                      name="asalSekolah"
                      required
                      value={formData.asalSekolah}
                      onChange={handleChange}
                      maxLength={100}
                      className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-gray-200 focus:border-[#5D9CEC] focus:ring-2 focus:ring-[#5D9CEC]/20 outline-none transition-all bg-gray-50 focus:bg-white text-sm md:text-base"
                      placeholder="Nama sekolah SD/MI asal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Tanggal Lahir</label>
                    <input
                      type="date"
                      name="tanggalLahir"
                      required
                      value={formData.tanggalLahir}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-gray-200 focus:border-[#5D9CEC] focus:ring-2 focus:ring-[#5D9CEC]/20 outline-none transition-all bg-gray-50 focus:bg-white text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Nama Orang Tua / Wali</label>
                    <input
                      type="text"
                      name="orangTua"
                      required
                      value={formData.orangTua}
                      onChange={handleChange}
                      maxLength={100}
                      className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-gray-200 focus:border-[#5D9CEC] focus:ring-2 focus:ring-[#5D9CEC]/20 outline-none transition-all bg-gray-50 focus:bg-white text-sm md:text-base"
                      placeholder="Nama orang tua"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Nomor WhatsApp Aktif</label>
                    <input
                      type="tel"
                      name="nomorWA"
                      required
                      value={formData.nomorWA}
                      onChange={handleChange}
                      pattern="[0-9]+"
                      maxLength={15}
                      className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-gray-200 focus:border-[#5D9CEC] focus:ring-2 focus:ring-[#5D9CEC]/20 outline-none transition-all bg-gray-50 focus:bg-white text-sm md:text-base"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2.5">Jenis Pendaftaran</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="jenisRegistrasi"
                          value="CPMB"
                          checked={formData.jenisRegistrasi === 'CPMB'}
                          onChange={handleChange}
                          className="w-4 h-4 text-[#5D9CEC] focus:ring-[#5D9CEC]"
                        />
                        <span className="text-sm md:text-base text-gray-700">CPMB</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="jenisRegistrasi"
                          value="Mutasi"
                          checked={formData.jenisRegistrasi === 'Mutasi'}
                          onChange={handleChange}
                          className="w-4 h-4 text-[#5D9CEC] focus:ring-[#5D9CEC]"
                        />
                        <span className="text-sm md:text-base text-gray-700">Mutasi</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#5D9CEC] text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-[#4A89DC] shadow-lg hover:shadow-xl transition-all"
                  >
                    Kirim Pendaftaran
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 md:py-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Pendaftaran Berhasil!</h3>
                  <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
                    Terima kasih telah mendaftar. Data Anda telah kami terima.
                    Silakan lanjutkan konfirmasi ke WhatsApp Admin kami.
                  </p>
                  <button
                    onClick={handleWhatsApp}
                    className="w-full bg-green-500 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-green-600 shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                    Konfirmasi WhatsApp
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSection;