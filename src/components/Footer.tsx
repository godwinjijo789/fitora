import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FitForceLogo } from './FitForceLogo';

export const Footer: React.FC = () => {
  const [phone, setPhone] = useState('+91 73585 70962');
  const [email, setEmail] = useState('trainwithjijo@gmail.com');
  const [location, setLocation] = useState("Sholinganallur, Chennai, TamilNadu, India");
  const [instagram, setInstagram] = useState('https://instagram.com');

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'homepageContent', 'home_singleton'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.contactPhone) setPhone(data.contactPhone);
          if (data.contactEmail) setEmail(data.contactEmail);
          if (data.contactLocation) setLocation(data.contactLocation);
          if (data.instagramUrl) setInstagram(data.instagramUrl);
        }
      },
      (err) => {
        console.warn('Could not subscribe to footer contacts:', err);
      }
    );
    return () => unsub();
  }, []);

  return (
    <footer className="bg-black text-zinc-400 border-t border-zinc-900 pt-16 pb-8 select-none" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Brand Section */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-1 group cursor-pointer" id="logo-link-footer">
            <FitForceLogo showText={true} iconClassName="w-10 h-10" textSize="text-lg font-black tracking-tighter text-white" />
          </Link>
          <p className="text-sm leading-relaxed text-zinc-500">
            Premium strength and holistic body transformations. Redefine your limits with results-driven coaching customized to your busy lifestyle.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-red-600 transition-colors"
              title="Instagram Profile"
              id="instagram-footer-link"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:hover:border-red-600 transition-colors"
              title="Send Mail"
              id="email-footer-link"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Quick Links Section */}
        <div>
          <h4 className="text-white font-extrabold tracking-widest text-xs uppercase mb-5 font-mono">
            COACHING PORTAL
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className="hover:text-red-500 transition-colors">
                Home Dashboard
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-red-500 transition-colors">
                About Mr. Delwin Jijo Coach
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Contacts */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-extrabold tracking-widest text-xs uppercase mb-1 font-mono">
            GET IN TOUCH
          </h4>
          <div className="flex gap-3 text-sm">
            <Phone className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{phone}</span>
          </div>
          <div className="flex gap-3 text-sm">
            <Mail className="w-5 h-5 text-red-500 flex-shrink-0" />
            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`} target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">{email}</a>
          </div>
          <div className="flex gap-3 text-sm leading-snug">
            <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-950 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <p className="text-zinc-600 font-medium">
          © {new Date().getFullYear()} FitForce By Jijo Brand. All Rights Reserved. Coached by Mr. Delwin Jijo Coach.
        </p>

        {/* Support -> Admin Login demanded below the footer */}
        <div className="flex flex-col items-center gap-2 text-zinc-600 font-medium">
          <span>Support</span>
          
          <Link
            to="/developer-support"
            id="developer-support-btn"
            className="text-zinc-500 hover:text-blue-500 transition-colors py-1 px-2 border border-zinc-900 bg-zinc-950/40 rounded hover:border-blue-950 hover:bg-blue-950/20 font-mono font-bold tracking-wider"
          >
            DEVELOPER SUPPORT
          </Link>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
