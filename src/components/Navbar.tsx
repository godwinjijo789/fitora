import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Dumbbell, Menu, X, ShieldAlert, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { FitoraLogo } from './FitoraLogo';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-2 px-1 text-sm font-semibold tracking-wider font-sans transition-all duration-300 ${
      isActive
        ? 'text-red-500'
        : 'text-zinc-300 hover:text-white'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-3 px-4 text-base font-bold tracking-widest font-sans rounded-lg transition-all ${
      isActive
        ? 'bg-red-950/40 text-red-500 border-l-4 border-red-600'
        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
    }`;

  return (
    <>
      <nav id="sticky-header" className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/80 border-b border-zinc-900 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 group cursor-pointer" id="logo-link">
              <FitoraLogo showText={true} iconClassName="w-12 h-12" textSize="text-xl font-black tracking-tighter text-white font-sans" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink key={link.path} to={link.path} className={linkClass}>
                  {({ isActive }) => (
                    <>
                      {link.name}
                      {isActive && (
                        <motion.div
                          layoutId="navUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* CTA/Admin indicators */}
            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                id="theme-toggle-desktop"
                className="p-2.5 rounded-xl border border-zinc-900 bg-zinc-950/40 text-zinc-300 hover:text-red-500 hover:bg-zinc-900/50 hover:border-zinc-800 transition-all flex items-center justify-center cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-red-600" />
                )}
              </button>

              {isAdmin && (
                <Link
                  to="/admin"
                  id="admin-dashboard-nav-btn"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-widest text-red-500 bg-red-950/30 border border-red-900/50 rounded-full hover:bg-red-900/40 transition-all font-mono"
                >
                  <ShieldAlert className="w-4 h-4" />
                  DASHBOARD
                </Link>
              )}
              {user && (
                <button
                  onClick={logout}
                  id="signout-nav-btn"
                  className="px-5 py-2.5 text-xs font-extrabold tracking-widest text-white hover:text-red-500 hover:bg-zinc-900 border border-zinc-800 rounded-lg transition-all"
                >
                  LOGOUT
                </button>
              )}
            </div>

            {/* Mobile Menu Open */}
            <div className="md:hidden flex items-center gap-2">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                id="theme-toggle-mobile"
                className="p-2 rounded-lg text-zinc-400 hover:text-red-500 transition-colors cursor-pointer flex items-center justify-center"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-red-600" />
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                id="mobile-menu-toggle-btn"
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-950 transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-zinc-950 border-b border-zinc-900"
            >
              <div className="px-2 pt-2 pb-6 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    {link.name}
                  </NavLink>
                ))}
                <div className="pt-4 px-4 flex flex-col gap-3">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1 px-4 py-3 text-sm font-bold tracking-widest text-red-500 bg-red-950/40 rounded-lg hover:bg-red-950 transition-colors font-mono"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      ADMIN CONSOLE
                    </Link>
                  )}
                  {user && (
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-center py-3 bg-zinc-900 hover:bg-zinc-800 text-sm font-bold tracking-widest text-white rounded-lg transition-colors"
                    >
                      LOGOUT
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};
export default Navbar;
