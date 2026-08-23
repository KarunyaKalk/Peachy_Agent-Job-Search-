import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PeachyMascotWidget } from '../Mascot/PeachyMascotWidget';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex relative">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-8 pb-24">
          <Outlet />
        </main>
      </div>

      {/* Global Persistent Mascot Guide */}
      <PeachyMascotWidget />
    </div>
  );
};
