import React, { useState, useEffect } from 'react';
import { FileText, Users, Activity } from 'lucide-react';
import { db } from '@/lib/db';

const DashboardHome = ({ user }) => {
  const [stats, setStats] = useState({
    articles: 0,
    pending: 0,
    registrants: 0,
    registrantsNew: 0,
    logs: []
  });

  useEffect(() => {
    (async () => {
      const news = db.getNews();
      const regs = await db.getRegistrants();
      const logs = db.getLogs();

      const regsArray = Array.isArray(regs) ? regs : [];

      setStats({
        articles: news.length,
        pending: news.filter(n => n.status === 'pending').length,
        registrants: regsArray.length,
        registrantsNew: regsArray.filter(r => r.status === 'new').length,
        logs: logs.slice(0, 5)
      });
    })();
  }, []);

  const StatCard = ({ label, value, icon: Icon, color, subLabel, subColor }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} />
        </div>
        {subLabel && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${subColor}`}>
            {subLabel}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.name} 👋</h2>
        <div className="mt-2 space-y-3 text-gray-600 text-sm leading-relaxed">
          <p>
            This website and dashboard were developed by M. Mabrur Riyamasey Mas'ud, S.Kom., S.H., a professional with dual academic concentrations in Information Technology and Law.
          </p>
          <div>
            <p className="font-semibold text-gray-700">This project is built using a modern, scalable, and SEO-friendly web architecture, including:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>React + Vite for a fast and optimized frontend</li>
              <li>Tailwind CSS for responsive and elegant UI styling</li>
              <li>React Router for clean navigation and page routing</li>
              <li>JSON/static data & API-ready structure for flexible data handling</li>
              <li>Admin CMS Dashboard for managing content dynamically</li>
              <li>Image optimization & SEO metadata support</li>
            </ul>
          </div>
          <p className="text-gray-500">Designed to be lightweight, mobile-first, secure, and future-ready.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Articles" 
          value={stats.articles} 
          icon={FileText} 
          color="bg-blue-50 text-blue-500" 
          subLabel="+12%" 
          subColor="bg-green-50 text-green-600"
        />
        <StatCard 
          label="Pending Review" 
          value={stats.pending} 
          icon={Activity} 
          color="bg-orange-50 text-orange-500" 
          subLabel={stats.pending > 0 ? "Action Needed" : "All Clear"}
          subColor={stats.pending > 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"}
        />
        <StatCard 
          label="Total Registrants" 
          value={stats.registrants} 
          icon={Users} 
          color="bg-purple-50 text-purple-500" 
        />
        <StatCard 
          label="New Registrants" 
          value={stats.registrantsNew} 
          icon={Users} 
          color="bg-green-50 text-green-500" 
          subLabel="This Month"
          subColor="bg-green-50 text-green-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Recent Activity Log</h3>
          <div className="space-y-6">
            {stats.logs.map(log => (
              <div key={log.id} className="flex gap-4 items-start">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-400 shrink-0" />
                <div>
                  <p className="text-sm text-gray-800 font-medium">{log.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID') : 'Tanggal tidak tersedia'} • {log.action}
                  </p>
                </div>
              </div>
            ))}
            {stats.logs.length === 0 && <p className="text-gray-400 text-sm">No recent activity.</p>}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#5D9CEC] to-[#4A89DC] p-6 rounded-2xl shadow-lg text-white">
          <h3 className="font-bold text-xl mb-2">School Status</h3>
          <p className="text-blue-100 text-sm mb-6">Academic Year 2026/2027</p>
          
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-xs text-blue-100 uppercase tracking-wider mb-1">PPDB Status</div>
              <div className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                OPEN (Gelombang 1)
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-xs text-blue-100 uppercase tracking-wider mb-1">System Version</div>
              <div className="font-bold">v2.0.1 (CMS)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;