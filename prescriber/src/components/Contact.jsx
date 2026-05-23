import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

const initialState = {
  name: "",
  email: "",
  message: "",
  // These are the defaults that will be overwritten if data exists in DB
  number: "+44 20 7946 0958",
  timings: "Monday - Friday: 9:00 AM - 6:00 PM, Saturday: 10:00 AM - 4:00 PM, Sunday: Closed",
  address: "123 Harley Street, London, W1G 6AX, United Kingdom",
  clinicEmail: "clinic@doctorg.com",
};

const Contact = () => {
  const [formData, setFormData] = useState(initialState);
  const [saving, setSaving] = useState(false);

  // Fetch data from DB to populate the clinic section and form
 const fetchData = async () => {
  try {
    const res = await API.get('/contact/clinic'); // ✅ new endpoint
    if (res.data) {
      setFormData(prev => ({
        ...prev,
        number:      res.data.number      || prev.number,
        timings:     res.data.timings     || prev.timings,
        address:     res.data.address     || prev.address,
        clinicEmail: res.data.clinicEmail || prev.clinicEmail,
      }));
    }
  } catch (err) {
    console.error('Error fetching contact:', err);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

 const handleSave = async () => {
  setSaving(true);
  try {
    await API.post('/contact', {  // ✅ posts message only
      name:    formData.name,
      email:   formData.email,
      message: formData.message,
    });
    toast.success('Message sent successfully');
    setFormData(prev => ({ ...prev, name: '', email: '', message: '' }));
  } catch (err) {
    toast.error('Failed to send message');
  } finally {
    setSaving(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
      <h1 className='text-2xl sm:text-3xl font-bold mb-8 text-center'>Contact Information</h1>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        
        {/* Section 1: Contact Form */}
        <div className='bg-gray-50 p-6 rounded-lg border border-gray-200'>
          <h2 className='text-lg sm:text-xl font-semibold mb-6 text-gray-800'>Contact Form</h2>
          
          <div className='mb-4'>
            <label className='block mb-1 font-medium text-xs sm:text-sm text-gray-700'>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className='border border-gray-300 rounded-md py-2 px-3 w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none transition' placeholder="Enter your name" />
          </div>
          <div className='mb-4'>
            <label className='block mb-1 font-medium text-xs sm:text-sm text-gray-700'>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className='border border-gray-300 rounded-md py-2 px-3 w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none transition' placeholder="Enter your email" />
          </div>
          <div className='mb-6'>
            <label className='block mb-1 font-medium text-xs sm:text-sm text-gray-700'>Message</label>
            <textarea name="message" value={formData.message} onChange={handleChange} className='border border-gray-300 rounded-md py-2 px-3 w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none transition' rows="4" placeholder="Enter your message" />
          </div>
        </div>

      {/* Section 2: Clinic Information (Displays DB Data) */}
<div className="bg-gray-50 px-10 py-12 ">

  <h2 className="text-xl font-bold text-slate-700 mb-5 text-center">
    Clinic Details
  </h2>

  <div className="space-y-5 text-center">

    <div className="group">
      <p className="text-[15px] font-black  text-slate-700 mb-1">
        Phone
      </p>
      <p className="text-base font-medium text-gray-900 ">
        {formData.number}
      </p>
      <div className="mt-2 h-px w-8 bg-gray-900 transition-all duration-300 group-hover:w-full" />
    </div>

    <div className="group">
      <p className="text-[15px] font-black text-slate-700 mb-1">
        Email
      </p>
      <p className="text-base font-medium text-gray-900 tracking-tight">
        {formData.clinicEmail}
      </p>
      <div className="mt-2 h-px w-8 bg-gray-900 transition-all duration-300 group-hover:w-full" />
    </div>

    <div className="group">
      <p className="text-[15px] font-black text-slate-700 mb-1">
        Hours
      </p>
      <p className="text-sm font-medium text-gray-900 leading-relaxed">
        {formData.timings}
      </p>
      <div className="mt-2 h-px w-8 bg-gray-900 transition-all duration-300 group-hover:w-full" />
    </div>

    <div className="group">
      <p className="text-[15px] font-black  text-slate-700 mb-1">
        Address
      </p>
      <p className="text-sm font-medium text-gray-900 leading-relaxed">
        {formData.address}
      </p>
      <div className="mt-2 h-px w-8 bg-gray-900 transition-all duration-300 group-hover:w-full" />
    </div>

  </div>
</div>
      </div>

      <div className='flex justify-center mt-8'>
        <button onClick={handleSave} disabled={saving} className='bg-black text-white px-8 sm:px-12 py-3 rounded-md hover:bg-gray-800 transition font-medium text-sm sm:text-base disabled:opacity-50'>
          {saving ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  );
};

export default Contact;