import React, { useState, useEffect } from 'react';
import API from "../api/axios";
import { CheckCircle, Shield, Award, Users, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TEAM = [
  {
    name: 'Dr. G',
    role: 'Lead Prescriber & Founder',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&q=80',
    bio: 'Over 15 years of experience in aesthetic medicine, dermatology, and clinical supply across the UK.',
  },
  {
    name: 'Dr. Sarah Collins',
    role: 'Senior Aesthetic Practitioner',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80',
    bio: 'Specialising in advanced injectables, skin rejuvenation, and evidence-based cosmetic therapies.',
  },
  {
    name: 'Dr. James Wright',
    role: 'Clinical Director',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&q=80',
    bio: 'Expert in regulatory compliance, professional healthcare standards, and clinical governance.',
  },
];

const VALUES = [
  { icon: Shield,  title: 'Safety First',       desc: 'All products are rigorously quality-checked and sourced from regulated suppliers only.' },
  { icon: Award,   title: 'Clinical Excellence', desc: 'We hold ourselves to the highest professional and ethical standards in the industry.' },
  { icon: Users,   title: 'Patient-Centred',     desc: 'Every decision we make prioritises the wellbeing of patients and practitioners.' },
  { icon: Star,    title: 'Premium Quality',     desc: 'Only the finest aesthetic medicines and skincare products make it onto our platform.' },
];

const About = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await API.get('/about');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch about text data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  const getDisplayValue = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.title || item.name || item.text || '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-white">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative h-[58vh] min-h-[400px] bg-black flex items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1400&q=80"
          alt="Medical clinic"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-white text-center w-full">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-4">
            About Us
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-6">
            {data?.aboutUs?.title || 'Redefining\nAesthetic Medicine'}
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {data?.aboutUs?.description ||
              'DoctorG is the trusted supply partner for aesthetic practitioners across the UK — delivering regulated medicines, premium skincare, and expert support.'}
          </p>
        </div>
      </section>

      {/* ── VISION STRIP ── */}
      <section className="bg-black text-white py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-3">
            {data?.ourVision?.title || 'Our Vision'}
          </p>
          <p className="text-xl md:text-2xl font-light leading-relaxed italic text-gray-100">
            "{data?.ourVision?.description ||
              'To be the most trusted and accessible platform for aesthetic healthcare professionals in the United Kingdom.'}"
          </p>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-3">What We Stand For</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-5 p-7 border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-md transition-all duration-300 group">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '500+',  label: 'Registered Practitioners' },
            { value: '15+',   label: 'Years of Experience' },
            { value: '2,000+',label: 'Products Supplied' },
            { value: '98%',   label: 'Satisfaction Rate' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-black mb-1">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-3">The People Behind DoctorG</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              {data?.ourTeam?.title || 'Meet Our Team'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {TEAM.map((member) => (
              <div key={member.name} className="group text-center">
                <div className="relative overflow-hidden rounded-2xl mb-5 aspect-[3/4] bg-gray-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-0.5 mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES (CMS-driven) ── */}
      {data?.ourServices?.servicesList?.length > 0 && (
        <section className="py-16 bg-gray-50 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-black mb-8">{data.ourServices.title || 'Our Services'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.ourServices.servicesList.map((service, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl text-left">
                  <CheckCircle size={16} className="text-gray-900 shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{getDisplayValue(service)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY CHOOSE US (CMS-driven) ── */}
      {data?.whyChooseUs?.points?.length > 0 && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-center mb-8">{data.whyChooseUs.title || 'Why Choose Us'}</h2>
            <ul className="space-y-3 max-w-md mx-auto">
              {data.whyChooseUs.points.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={11} className="text-white" />
                  </span>
                  <span className="text-sm text-gray-600 leading-relaxed">{getDisplayValue(point)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── OUR COMMITMENT (CMS-driven) ── */}
      {data?.ourCommitment?.description && (
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-black mb-4">{data.ourCommitment.title || 'Our Commitment'}</h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {data.ourCommitment.description}
            </p>
          </div>
        </section>
      )}


      {/* ── CTA ── */}
      <section className="py-20 bg-black text-white text-center px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-4">Get Started</p>
        <h2 className="text-3xl md:text-4xl font-black mb-5 tracking-tight">Ready to work with us?</h2>
        <p className="text-gray-300 text-base mb-8 max-w-md mx-auto">
          Join hundreds of aesthetic practitioners who trust DoctorG for their supply needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contact" className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-3.5 font-bold text-sm hover:bg-gray-200 transition">
            Contact Us <ArrowRight size={15} />
          </Link>
          <Link to="/register" className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-3.5 font-bold text-sm hover:border-white transition">
            Register Now <ArrowRight size={15} />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default About;