import React, { useState } from 'react';
import { getSettings, updateSettings } from '@/lib/settingsApi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SettingsManager = ({ user }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({});

  React.useEffect(() => {
    getSettings().then(setSettings).catch(() => setSettings({}));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSettings = {
      site_name: formData.get('siteName'),
      contact_phone: formData.get('whatsappNumber'),
      contact_email: formData.get('email'),
      address: formData.get('address'),
      social_links: {
        instagram: formData.get('instagramUrl'),
        youtube: formData.get('youtubeUrl')
      }
    };
    await updateSettings(newSettings);
    const refreshed = await getSettings();
    setSettings(refreshed);
    toast({ title: "Updated", description: "System settings updated successfully" });
  };

  if (user.role !== 'Superadmin') return <div className="p-8 text-center text-red-500">Access Denied</div>;

  return (
    <div className="max-w-4xl animate-in fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input name="siteName" defaultValue={settings.siteName} className="w-full p-3 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Official Email</label>
              <input name="email" defaultValue={settings.email} className="w-full p-3 border rounded-xl" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
              <input name="whatsappNumber" defaultValue={settings.whatsappNumber} className="w-full p-3 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
              <input name="instagramUrl" defaultValue={settings.instagramUrl} className="w-full p-3 border rounded-xl" />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
             <input name="youtubeUrl" defaultValue={settings.youtubeUrl} className="w-full p-3 border rounded-xl" />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">School Address</label>
             <textarea name="address" defaultValue={settings.address} className="w-full p-3 border rounded-xl h-24" />
          </div>

          <div className="pt-4 border-t border-gray-100">
             <Button type="submit" className="bg-[#5D9CEC] hover:bg-[#4A89DC] w-full md:w-auto">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsManager;