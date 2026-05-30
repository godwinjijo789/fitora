import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { motion } from 'motion/react';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const triggered = sessionStorage.getItem('accessDeniedTriggered');
    if (!triggered) {
      navigate('/', { replace: true });
    } else {
      sessionStorage.removeItem('accessDeniedTriggered');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] bg-[#070708] text-white p-4 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-amber-950/30 text-amber-500 rounded-2xl border border-amber-900/30">
            <ShieldAlert className="w-10 h-10 animate-fade" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
          ACCESS CLEARANCE DENIED
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-8">
          Your active Google authentication is authenticated, but your email is not registered on the trainer list. Only authorized trainers are permitted to modify exercise programs, pictures, videos, or delete enquiries.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Home className="w-4 h-4" /> RETURN HOME PAGE
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
export default AccessDenied;
