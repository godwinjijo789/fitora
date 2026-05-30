import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Dumbbell, Chrome } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLogin: React.FC = () => {
  const { user, isAdmin, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignIn = async () => {
    try {
      const loggedInUser = await loginWithGoogle();
      if (loggedInUser) {
        // Validation check is auto-run in context.
        // It signs them out if they are not inside admin emails list.
      }
    } catch (err) {
      console.error('Login action error:', err);
      showToast('Google login was interrupted.', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#070708] text-white p-4 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-3xl p-8 sm:p-10 shadow-2xl text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-950/40 text-red-600 rounded-2xl border border-red-900/40">
            <ShieldCheck className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
          ADMIN HUB
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm font-medium tracking-wide mb-8 max-w-xs mx-auto">
          Authorization layer reserved strictly for certified coach brands. Google credential verification required.
        </p>

        {/* Action Button */}
        <button
          onClick={handleSignIn}
          id="google-login-action-btn"
          className="w-full py-4 px-6 bg-white hover:bg-zinc-100 text-black font-extrabold text-sm tracking-wide rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg cursor-pointer border border-zinc-200"
        >
          <Chrome className="w-5 h-5 flex-shrink-0 text-red-500 fill-red-500" />
          <span>SIGN IN WITH GOOGLE</span>
        </button>

        <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-center gap-2 text-[10px] text-zinc-600 font-mono tracking-wider">
          <Dumbbell className="w-4 h-4 text-zinc-700" />
          <span>FITFORCE BY JIJO MANAGEMENT SYSTEM</span>
        </div>
      </motion.div>
    </div>
  );
};
export default AdminLogin;
