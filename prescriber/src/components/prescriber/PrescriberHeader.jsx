import { MdNotifications, MdSearch } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const PrescriberHeader = ({ title, alertCount = 0 }) => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {user?.prescriberId} · {user?.practiceName || 'Prescriber Portal'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <MdSearch className="text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-700 outline-none w-36 placeholder-gray-400"
          />
        </div>

        {/* Alerts bell */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition text-gray-500">
          <MdNotifications size={20} />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white
              text-[9px] font-bold rounded-full flex items-center justify-center">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
      </div>
    </div>
  );
};

export default PrescriberHeader;