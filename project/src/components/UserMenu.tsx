import React, { useState } from 'react';
import { User, ChevronDown, Shield } from 'lucide-react';
import AdminManagement from './AdminManagement';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdminInfo, setShowAdminInfo] = useState(false);

  return (
    <div className="relative">
      {/* User Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all duration-200 hover:shadow-lg"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
          
          <button
            onClick={() => {
              setShowAdminInfo(true);
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">Management</span>
          </button>
        </div>
      )}

      {/* Admin Management Modal */}
      {showAdminInfo && (
        <AdminManagement onClose={() => setShowAdminInfo(false)} />
      )}
    </div>
  );
};

export default UserMenu; 