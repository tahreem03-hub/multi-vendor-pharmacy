import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock, Send, ArrowRight } from 'lucide-react';

const initialState = {
  name: "",
  email: "",
  message: "",
  number: "+44 20 7946 0958",
  timings: "Monday – Friday: 9:00 AM – 6:00 PM\nSaturday: 10:00 AM – 4:00 PM\nSunday: Closed",
  address: "123 Harley Street, London, W1G 6AX, United Kingdom",
  clinicEmail: "clinic@doctorg.com",
};

const Contact = () => {
  const [formData, setFormData] = useState(initialState);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await API.get('/contact/clinic');
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
      await API.post('/contact', {
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
    <div className="bg-white antialiased">

      {/* ── HERO ── */}
      <section className="relative h-[42vh] min-h-[280px] bg-black flex items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=80"
          alt="Clinic reception"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-white text-center w-full">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-3">Get In Touch</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Contact Us</h1>
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            We'd love to hear from you. Reach out to our team and we'll respond promptly.
          </p>
        </div>
      </section>

      {/* ── INFO STRIP ── */}
      <div className="bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Phone, label: 'Call Us',      value: formData.number },
            { icon: Mail,  label: 'Email Us',     value: formData.clinicEmail },
            { icon: MapPin,label: 'Visit Us',     value: 'London, UK' },
            { icon: Clock, label: 'Open Hours',   value: 'Mon–Fri: 9am–6pm' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={15} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                <p className="text-xs text-gray-200 font-medium truncate max-w-[120px]">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* ── LEFT: Form ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-2">Send a Message</p>
            <h2 className="text-2xl font-black mb-8 tracking-tight">We'll get back to you shortly</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. John Smith"
                  className="w-full border border-gray-200 py-3.5 px-4 text-sm text-gray-900 outline-none focus:border-black transition-colors placeholder-gray-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hello@yourclinic.com"
                  className="w-full border border-gray-200 py-3.5 px-4 text-sm text-gray-900 outline-none focus:border-black transition-colors placeholder-gray-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows={6}
                  className="w-full border border-gray-200 py-3.5 px-4 text-sm text-gray-900 outline-none focus:border-black transition-colors placeholder-gray-300 resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 font-bold text-sm tracking-wide hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                {saving ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>

          {/* ── RIGHT: Clinic Info ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-2">Find Us</p>
            <h2 className="text-2xl font-black mb-8 tracking-tight">Clinic Information</h2>

            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Address</p>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">{formData.address}</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Phone</p>
                  <p className="text-sm text-gray-800 font-medium">{formData.number}</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Email</p>
                  <p className="text-sm text-gray-800 font-medium">{formData.clinicEmail}</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Opening Hours</p>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-line">{formData.timings}</p>
                </div>
              </div>
            </div>

            {/* Professional note */}
            <div className="mt-10 p-6 bg-gray-950 text-white rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Professional Enquiries</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                For wholesale orders, prescriber registration, or clinical partnerships — please include your professional registration number in your message.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Contact;