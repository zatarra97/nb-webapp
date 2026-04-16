import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const navItems = [
  { path: '/admin/contenuti', label: 'Contenuti', icon: 'fa-align-left' },
  { path: '/admin/eventi', label: 'Eventi', icon: 'fa-calendar' },
  { path: '/admin/press', label: 'Press', icon: 'fa-newspaper' },
  { path: '/admin/gallery', label: 'Gallery', icon: 'fa-images' },
  { path: '/admin/discografia', label: 'Discografia', icon: 'fa-music' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">NB Admin</h1>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <i className={`fas ${item.icon} w-4 text-center`}></i>
                {item.label}
              </Link>
            );
          })}
        </nav>
        {onLogout && (
          <div className="px-3 py-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <i className="fas fa-right-from-bracket w-4 text-center"></i>
              Esci
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
