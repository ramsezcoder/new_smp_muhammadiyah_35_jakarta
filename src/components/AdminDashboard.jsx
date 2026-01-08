import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FileText, Users, Settings, LogOut, Menu, X, 
  Bell, Image, Layers, Video
} from 'lucide-react';
import { apiVerify, apiLogout } from '@/lib/authApi';
import AdminLogin from '@/components/AdminLogin';
import { useToast } from '@/components/ui/use-toast';

// Import Admin Sub-Components
import NewsManager from '@/components/admin/NewsManager';
import DashboardHome from '@/components/admin/DashboardHome';
import SettingsManager from '@/components/admin/SettingsManager';
import RegistrantManager from '@/components/admin/RegistrantManager';
import GalleryManager from '@/components/admin/GalleryManager';
import StaffManager from '@/components/admin/StaffManager';
import VideoManager from '@/components/admin/VideoManager';

// Temporary placeholders for incomplete components
const PagesManager = () => <div className="p-8 text-center text-gray-500">Pages Management Module (Coming Soon)</div>;
const UserManager = () => <div className="p-8 text-center text-gray-500">User Management Module (Coming Soon)</div>;

const AdminDashboard = ({ onLogout }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Check session on mount
  useEffect(() => {
    const sessionStr = localStorage.getItem('app_session');
    if (!sessionStr) return;
    try {
      const session = JSON.parse(sessionStr);
      const token = session?.token;
      if (!token) return;
      (async () => {
        try {
          const verifiedUser = await apiVerify(token);
          if (verifiedUser) {
            setUser(verifiedUser);
          } else {
            localStorage.removeItem('app_session');
          }
        } catch (e) {
          // On 401/403, clear session and force re-login
          localStorage.removeItem('app_session');
          setUser(null);
        }
      })();
    } catch {
      localStorage.removeItem('app_session');
    }
  }, []);

  const handleLogout = async () => {
    try {
      const sessionStr = localStorage.getItem('app_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const token = session?.token;
        if (token) await apiLogout(token);
      }
    } catch {}
    localStorage.removeItem('app_session');
    setUser(null);
    onLogout && onLogout();
    toast({ title: 'Logged Out', description: 'See you next time!' });
  };

  if (!user) {
    return <AdminLogin onLoginSuccess={setUser} />;
  }

  // Define Menu Items based on Roles
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      roles: ['Superadmin', 'Admin', 'Post Maker'] 
    },
    { 
      id: 'news_school', 
      label: 'News School', 
      icon: FileText, 
      roles: ['Superadmin', 'Admin'] 
    },
    { 
      id: 'news_student', 
      label: 'News Student', 
      icon: FileText, 
      roles: ['Superadmin', 'Admin'] 
    },
    { 
      id: 'media', 
      label: 'Media Library', 
      icon: Image, 
      roles: ['Superadmin', 'Admin', 'Post Maker'] 
    },
    { 
      id: 'registrants', 
      label: 'Registrants', 
      icon: Users, 
      roles: ['Superadmin', 'Admin'] 
    },
    { 
      id: 'staff_manager', 
      label: 'Staff Profile Manager', 
      icon: Users, 
      roles: ['Superadmin'] 
    },
    { 
      id: 'video_manager', 
      label: 'Video Gallery Manager', 
      icon: Video, 
      roles: ['Superadmin'] 
    },
    { 
      id: 'pages', 
      label: 'Pages', 
      icon: Layers, 
      roles: ['Superadmin', 'Admin'] 
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: Users, 
      roles: ['Superadmin'] 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      roles: ['Superadmin'] 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-roboto flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-20 overflow-hidden shadow-xl lg:shadow-none flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5D9CEC] rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm">M35</div>
          <div className="overflow-hidden whitespace-nowrap">
            <h2 className="font-bold text-gray-800">Admin CMS</h2>
            <p className="text-xs text-[#5D9CEC] font-medium uppercase tracking-wider">{user.role}</p>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
  {(Array.isArray(menuItems) ? menuItems : [])
    .filter(item => Array.isArray(item.roles) && item.roles.includes(user?.role))
    .map(item => (
      <button
        key={item.id}
        onClick={() => { 
          setActiveTab(item.id); 
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
          activeTab === item.id 
            ? 'bg-[#E8F4F8] text-[#5D9CEC] font-medium shadow-sm' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <item.icon size={20} />
        {item.label}
      </button>
    ))}
</nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[280px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#5D9CEC] to-[#4A89DC] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-6 md:p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <DashboardHome user={user} />}
          {activeTab === 'news_school' && <NewsManager user={user} channel="school" />}
          {activeTab === 'news_student' && <NewsManager user={user} channel="student" />}
          {activeTab === 'registrants' && <RegistrantManager user={user} />}
          {activeTab === 'staff_manager' && <StaffManager user={user} />}
          {activeTab === 'video_manager' && <VideoManager user={user} />}
          {activeTab === 'settings' && <SettingsManager user={user} />}
          {activeTab === 'media' && <GalleryManager user={user} />}
          {activeTab === 'pages' && <PagesManager user={user} />}
          {activeTab === 'users' && <UserManager user={user} />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;