
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient'; // Adjust path if needed
import { Bell, User, Search, LogOut } from 'lucide-react';

const Header = ({ title, subtitle }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-6 md:px-8 py-4">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2.5 w-64 border border-slate-300 rounded-lg bg-slate-50/70 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Open notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-sm">
              <p className="font-medium text-slate-900 leading-4">Admin User</p>
              <p className="text-xs text-slate-500 mt-0.5">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
