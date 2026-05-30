import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import { AnimatePresence, motion } from 'motion/react';

export const MainLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-[#070708] text-white">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Content Area with elegant fade-in transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer detailing specifications and dynamic admin gateway */}
      <Footer />

      {/* Call / WhatsApp Quick actions */}
      <FloatingActions />
    </div>
  );
};
export default MainLayout;
