import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPlaceholder: React.FC = () => {
  const { adminData, logout } = useAuth();

  return (
    <div className="min-h-screen bg-black flex flex-col p-8 font-zalando">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-sm uppercase tracking-widest text-brand-orange mb-1">System Overview</h2>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white font-bold">{adminData?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500 uppercase">{adminData?.role || 'Management'}</p>
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 border border-brand-orange/30 text-brand-orange text-xs uppercase font-bold 
                     hover:bg-brand-orange hover:text-black transition-all rounded"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-32 flex flex-col justify-end">
            <div className="w-8 h-8 bg-brand-orange/20 rounded-lg mb-4"></div>
            <div className="w-1/2 h-4 bg-zinc-800 rounded mb-2"></div>
            <div className="w-1/3 h-3 bg-zinc-800/50 rounded"></div>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 opacity-20">📊</div>
          <p className="text-zinc-500 uppercase tracking-widest text-xs">Features coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPlaceholder;
