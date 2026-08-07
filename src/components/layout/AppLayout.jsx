import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import s from '../../styles/layout/AppLayout.module.css';
import { AuroraBackground, FloatingParticles } from '../effects';

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={s.appContainer}>
      {/* Background ambient effects (optional, keep it subtle for dashboard) */}
      <AuroraBackground />
      <FloatingParticles />

      {/* Sidebar - fixed on left */}
      <div className={s.sidebarWrapper}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={setIsSidebarOpen} />
      </div>

      {/* Mobile overlay for sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={s.mainWrapper}>
        <TopHeader toggleSidebar={setIsSidebarOpen} />
        
        <main className={s.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
