import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
