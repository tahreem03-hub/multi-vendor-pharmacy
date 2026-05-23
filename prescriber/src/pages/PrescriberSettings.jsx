import React, { useState } from 'react';
import { FileText, Layout, Image, Sliders, Info } from 'lucide-react';

// ── Import the detail panels to render them inline ───────────────────
import PrescriberPosts from '../components/PrescriberPosts';
import FooterSetting from './FooterSettings';
import MediaManager from '../components/MediaManager';
import SliderManager from '../components/SliderManager'; // Added SliderManager import
import AboutSettings from './AboutSetting'; // Added AboutSettings import

const PrescriberSettings = () => {
  // Set the first option as active by default so the page never looks empty
  const [activeSubView, setActiveSubView] = useState('posts');

  const options = [
    {
      id: 'posts',
      title: 'Manage Posts',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'about-settings',
      title: 'About Settings',
      icon: <Info className="w-4 h-4" />,
    },
    {
      id: 'slider-manager', // Added Slider Manager Option
      title: 'Slider Manager',
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: 'footer-settings',
      title: 'Edit Footer',
      icon: <Layout className="w-4 h-4" />,
    },
    {
      id: 'media-manager',
      title: 'Media Manager',
      icon: <Image className="w-4 h-4" />,
    },
  ];

  // Render the selected view dynamically right below the persistent tabs
  const renderSubView = () => {
    switch (activeSubView) {
      case 'posts':
        return <PrescriberPosts />;
      case 'about-settings':
        return <AboutSettings />;
      case 'slider-manager': // Added condition to render Slider Manager inline
        return <SliderManager />;
      case 'footer-settings':
        return <FooterSetting />;
      case 'media-manager':
        return <MediaManager />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white min-h-screen p-8 text-slate-600">
      {/* ── Header ── */}
      <div className="mb-6 border-b border-slate-100 pb-4 bg-white">
        <h2 className="text-xl font-medium tracking-tight text-slate-800">
          Settings Configuration
        </h2>
        <p className="text-sm font-medium text-slate-600 mt-1">
          Customize your posts, sliders, footer details, and uploaded media assets dynamically.
        </p>
      </div>

      {/* ── Persistent Options Navigation Tab Bar ── */}
      <div className="flex flex-row gap-3 mb-8 bg-white border-b border-slate-100 pb-4 overflow-x-auto whitespace-nowrap scrollbar-none">
        {options.map((option) => {
          const isActive = activeSubView === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setActiveSubView(option.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 focus:outline-none ${
                isActive
                  ? 'bg-slate-600 text-white border-slate-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {option.icon}
              {option.title}
            </button>
          );
        })}
      </div>

      {/* ── Active View Form Details Container ── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-2">
        {renderSubView()}
      </div>
    </div>
  );
};

export default PrescriberSettings;