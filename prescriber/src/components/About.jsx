import React, { useState, useEffect } from 'react';
import API from "../api/axios";

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
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white text-gray-800 antialiased">
      
      {/* ── HERO / ABOUT US ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
          {data.aboutUs?.title || 'About Us'}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
          {data.aboutUs?.description}
        </p>
      </section>

      <hr className="border-gray-100 max-w-3xl mx-auto" />

      {/* ── OUR VISION ── */}
      <section className="bg-white py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            {data.ourVision?.title || 'Our Vision'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 italic font-medium max-w-2xl mx-auto leading-relaxed">
            "{data.ourVision?.description}"
          </p>
        </div>
      </section>

      <hr className="border-gray-100 max-w-3xl mx-auto" />

      {/* ── OUR SERVICES ── */}
      {data.ourServices?.servicesList?.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            {data.ourServices.title || 'Our Services'}
          </h2>
          <div className="space-y-3">
            {data.ourServices.servicesList.map((service, i) => (
              <div key={i} className="text-sm sm:text-base text-gray-700 font-medium">
                {getDisplayValue(service)}
              </div>
            ))}
          </div>
        </section>
      )}

      <hr className="border-gray-100 max-w-3xl mx-auto" />

      {/* ── WHY CHOOSE US ── */}
      {data.whyChooseUs?.points?.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6">
            {data.whyChooseUs.title || 'Why Choose Us'}
          </h2>
          <ul className="space-y-2.5 text-sm sm:text-base text-gray-600 max-w-md mx-auto">
            {data.whyChooseUs.points.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gray-400 font-bold">•</span>
                <span>{getDisplayValue(point)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <hr className="border-gray-100 max-w-3xl mx-auto" />

      {/* ── OUR TEAM ── */}
      {data.ourTeam?.members?.length > 0 && (
        <section className="bg-white py-10 sm:py-12 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              {data.ourTeam.title || 'Our Team'}
            </h2>
            <div className="flex flex-col items-center gap-3">
              {data.ourTeam.members.map((member, i) => (
                <div key={i} className="text-sm sm:text-base font-medium text-gray-700">
                  {getDisplayValue(member)}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <hr className="border-gray-100 max-w-3xl mx-auto" />

      {/* ── OUR COMMITMENT ── */}
      {data.ourCommitment?.description && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            {data.ourCommitment.title || 'Our Commitment'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
            {data.ourCommitment.description}
          </p>
        </section>
      )}
      
    </div>
  );
};

export default About;