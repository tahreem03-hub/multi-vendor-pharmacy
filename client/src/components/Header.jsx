import { BiSearch, BiDownload, BiPlus, BiBell } from 'react-icons/bi';

const Header = ({ title }) => {
  return (
    <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-100 sticky top-0 z-50">
      
      {/* title section */}
      <div className="flex items-center gap-4 min-w-fit">
        <div className="w-2 h-8 bg-black rounded-full" />
        <div>
          <h1 className="text-base font-black text-black tracking-tight leading-none">{title}</h1>
        </div>
      </div>

      {/* expanded search bar */}
      <div className="flex-1 mx-12 max-w-xl relative group">
        <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" size={20} />
        <input
          type="text"
          placeholder="search records, transactions, or users..."
          className="w-full pl-12 pr-6 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-black placeholder:text-slate-400 focus:outline-none focus:border-black transition-all shadow-sm"
        />
      </div>

      {/* enhanced action buttons */}
      <div className="flex items-center gap-3 min-w-fit">
        <button className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold tracking-widest border border-slate-200 text-black rounded-lg hover:bg-slate-50 hover:border-black transition-all shadow-sm">
          <BiDownload size={16} /> export
        </button>
        
        <button className="flex items-center gap-2 px-5 py-2 text-[11px] font-bold tracking-widest bg-black hover:bg-slate-800 text-white rounded-lg transition-all shadow-md">
          <BiPlus size={16} /> new entry
        </button>

        <div className="w-px h-8 bg-slate-100 mx-2" />

        <button className="relative w-10 h-10 flex items-center justify-center border border-slate-200 text-black rounded-lg hover:border-black hover:bg-slate-50 transition-all">
          <BiBell size={22} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-black rounded-full border-2 border-white" />
        </button>
      </div>

    </div>
  );
};

export default Header;