import React, { useState, useEffect } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const RegistrantManager = ({ user }) => {
  const [registrants, setRegistrants] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
  async function load() {
    const rows = await db.getRegistrants();
    setRegistrants(Array.isArray(rows) ? rows : []);
  }
  load();
}, []);

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this registrant?')) {
      await db.deleteRegistrant(id, user.id);
      const rows = await db.getRegistrants();
      setRegistrants(Array.isArray(rows) ? rows : []);
      toast({ title: "Deleted", description: "Registrant deleted" });
    }
};

  const handleExport = () => {
    const headers = ['Nama', 'Asal Sekolah', 'Ortu', 'WA', 'Jenis', 'Tanggal'];
    const csvContent = [
      headers.join(','),
      ...registrants.map(r => {
          const date = r.tanggalLahir ? 
            new Date(r.tanggalLahir).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
              year: 'numeric'
          }) : '-';
        return [r.namaLengkap, r.asalSekolah || '-', r.orangTua, r.nomorWA, r.jenisRegistrasi || '-', date].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ppdb_data.csv';
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">PPDB Registrants</h2>
        {user.role !== 'Post Maker' && (
           <Button onClick={handleExport} variant="outline" className="gap-2"><Upload size={16} /> Export CSV</Button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Asal Sekolah</th>
              <th className="p-4 font-medium">Parent</th>
              <th className="p-4 font-medium">WhatsApp</th>
              <th className="p-4 font-medium">Jenis</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {registrants.map((reg) => (
              <tr key={reg.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-medium text-gray-800">{reg.namaLengkap}</td>
                <td className="p-4 text-gray-500">{reg.asalSekolah || '-'}</td>
                <td className="p-4 text-gray-500">{reg.orangTua}</td>
                <td className="p-4 text-gray-500">{reg.nomorWA}</td>
                <td className="p-4 text-gray-500">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {reg.jenisRegistrasi || 'CPMB'}
                  </span>
                </td>
                <td className="p-4 text-gray-500">
                    {reg.tanggalLahir ? 
                      new Date(reg.tanggalLahir).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                        year: 'numeric'
                    }) : '-'
                  }
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                    reg.status === 'new' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {reg.status || 'new'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {user.role !== 'Post Maker' && (
                     <button onClick={() => handleDelete(reg.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                  )}
                </td>
              </tr>
            ))}

            {registrants.length === 0 && (
              <tr><td colSpan="8" className="p-8 text-center text-gray-400">No registrants yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrantManager;