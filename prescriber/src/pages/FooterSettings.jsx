import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

const FooterSettings = () => {
  const initialState = {
    logo: '',
    awardInfo:      { logo: '', description: '' },
    links:          [],
    addresses:      [''],
    regulatoryText: '',
    socialLinks:    [],
    certifications: []
  };

  const [formData, setFormData] = useState(initialState);
  const [file,    setFile]    = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(false);

 

  useEffect(() => {
   
    setFormData(initialState);
    setFile(null);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const data = new FormData();
    if (file) data.append('logo', file);
    data.append('regulatoryText',  formData.regulatoryText  || '');
    data.append('awardInfo',       JSON.stringify(formData.awardInfo       || {}));
    data.append('socialLinks',     JSON.stringify(formData.socialLinks     || []));
    data.append('addresses',       JSON.stringify(formData.addresses       || []));
    data.append('links',           JSON.stringify(formData.links           || []));
    data.append('certifications',  JSON.stringify(formData.certifications  || []));

    try {
      await API.put('/footer', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Footer updated successfully!');
      setFormData(initialState);
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update.');
    } finally {
      setSaving(false);
    }
  };

 

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
    setFile(null);
  };

  const addSocialLink    = () =>
    setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, { platform: '', url: '' }] }));

  const removeSocialLink = (index) =>
    setFormData(prev => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== index) }));

  const updateSocialLink = (index, key, value) => {
    const updated = [...formData.socialLinks];
    updated[index][key] = value;
    setFormData(prev => ({ ...prev, socialLinks: updated }));
  };

  const addAddress    = () =>
    setFormData(prev => ({ ...prev, addresses: [...prev.addresses, ''] }));

  const removeAddress = (index) =>
    setFormData(prev => ({ ...prev, addresses: prev.addresses.filter((_, i) => i !== index) }));

  const updateAddress = (index, value) => {
    const updated = [...formData.addresses];
    updated[index] = value;
    setFormData(prev => ({ ...prev, addresses: updated }));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16 bg-white min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold mb-6">Footer Configuration</h1>

      <div className="space-y-6">

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium mb-2">Footer Logo</label>
          {(formData.logo || file) && (
            <div className="relative inline-block">
              <img
                src={file ? URL.createObjectURL(file) : `http://localhost:4000${formData.logo}`}
                alt="Logo"
                className="h-16 mb-2 border rounded p-1 b"
              />
              <button type="button" onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✕</button>
            </div>
          )}
          <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full border rounded-lg p-2" />
        </div>

        {/* Regulatory Text */}
        <div>
          <label className="block text-sm font-medium mb-1">Regulatory Text</label>
          <textarea className="w-full border rounded-lg p-2" rows="3"
            value={formData.regulatoryText}
            onChange={e => setFormData({ ...formData, regulatoryText: e.target.value })} />
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium mb-2">Social Media Links</label>
          {formData.socialLinks.map((link, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input placeholder="Platform" className="border rounded p-2 w-1/3"
                value={link.platform} onChange={e => updateSocialLink(index, 'platform', e.target.value)} />
              <input placeholder="URL" className="border rounded p-2 flex-1"
                value={link.url} onChange={e => updateSocialLink(index, 'url', e.target.value)} />
              <button type="button" onClick={() => removeSocialLink(index)}
                className="text-white w-8 h-8 bg-black rounded-full flex items-center justify-center shrink-0">✕</button>
            </div>
          ))}
          <button type="button" onClick={addSocialLink}
            className="text-sm bg-teal-600 text-white px-4 py-2 rounded">+ Add Link</button>
        </div>

        {/* Addresses */}
        <div>
          <label className="block text-sm font-medium mb-2">Addresses</label>
          {formData.addresses.map((addr, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input placeholder="e.g., 123 Healthcare Way, London, UK"
                className="border rounded-lg p-2 flex-1"
                value={addr} onChange={e => updateAddress(index, e.target.value)} />
              <button type="button" onClick={() => removeAddress(index)}
                className="text-white w-8 h-8 bg-black rounded-full flex items-center justify-center shrink-0">✕</button>
            </div>
          ))}
          <button type="button" onClick={addAddress}
            className="text-sm bg-teal-600 text-white px-4 py-2 rounded">+ Add Address</button>
        </div>

        {/* Save */}
        <div className="pt-4 border-t">
          <button type="button" onClick={handleSave} disabled={saving}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 font-semibold transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default FooterSettings;