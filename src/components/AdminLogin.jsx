import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const AdminLogin = ({ onLoginSuccess }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate network delay
      setTimeout(() => {
        try {
          const session = db.login(email, password);
          toast({
            title: "Login Berhasil",
            description: `Selamat datang kembali, ${session.user.name}`,
          });
          onLoginSuccess(session.user);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }, 800);
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F4F8] flex items-center justify-center p-4">
      {/* Return to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-[#5D9CEC] transition-colors font-medium text-sm"
      >
        <ArrowLeft size={18} />
        Kembali ke Beranda
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8 pb-6 border-b border-gray-100 text-center bg-gradient-to-b from-white to-gray-50">
          <div className="w-16 h-16 bg-[#5D9CEC] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white font-bold text-2xl">
            M35
          </div>
          <h2 className="font-poppins text-2xl font-bold text-gray-800">Admin Portal</h2>
          <p className="text-gray-500 text-sm mt-1">SMP Muhammadiyah 35 Jakarta</p>
        </div>

        <div className="p-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-6"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#5D9CEC] focus:ring-2 focus:ring-[#5D9CEC]/20 outline-none transition-all"
                  placeholder="admin@smpmuh35.id"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#5D9CEC] focus:ring-2 focus:ring-[#5D9CEC]/20 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#5D9CEC] hover:bg-[#4A89DC] h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
              {!isLoading && <ArrowRight size={18} className="ml-2" />}
            </Button>
          </form>

          <div className="mt-8 text-center">
             <p className="text-xs text-gray-400">
               Secure Access • Role Based Control • Activity Logging
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;