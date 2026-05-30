import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface FloatingActionsProps {
  phoneNumber?: string;
  whatsappNumber?: string;
  message?: string;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  phoneNumber: propPhoneNumber,
  whatsappNumber: propWhatsappNumber,
  message = "Hello Coach! I want to join your premium training program. Please provide me details!"
}) => {
  const [phoneNumber, setPhoneNumber] = useState(propPhoneNumber || "+917358570762");
  const [whatsappNumber, setWhatsappNumber] = useState(propWhatsappNumber || "917358570762");

  useEffect(() => {
    const unsubHome = onSnapshot(
      doc(db, 'homepageContent', 'home_singleton'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.contactPhone) {
            setPhoneNumber(data.contactPhone);
          }
          if (data.whatsappNumber) {
            setWhatsappNumber(data.whatsappNumber);
          }
        }
      },
      (err) => {
        console.warn("Could not bind real-time contact changes in floating actions:", err);
      }
    );
    return () => unsubHome();
  }, []);

  const cleanWhatsapp = whatsappNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(message)}`;
  const telUrl = `tel:${phoneNumber}`;

  return (
    <div className="fixed bottom-6 left-6 z-[40] flex flex-col gap-3">
      {/* WhatsApp Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="whatsapp-floating-btn"
        className="flex items-center justify-center p-4 bg-green-500 hover:bg-green-600 font-sans text-white rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.8)] transition-all cursor-pointer border border-green-400 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Chat on WhatsApp"
      >
        <MessageSquare className="w-6 h-6 flex-shrink-0 fill-white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out font-semibold text-xs whitespace-nowrap pl-0 group-hover:pl-2 group-hover:pr-1">
          WhatsApp Main
        </span>
      </motion.a>

      {/* Call Now Button */}
      <motion.a
        href={telUrl}
        id="call-floating-btn"
        className="flex items-center justify-center p-4 bg-red-600 hover:bg-red-700 font-sans text-white rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.8)] transition-all cursor-pointer border border-red-500 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Call Trainer Now"
      >
        <Phone className="w-6 h-6 flex-shrink-0 fill-white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out font-semibold text-xs whitespace-nowrap pl-0 group-hover:pl-2 group-hover:pr-1">
          Call Coach
        </span>
      </motion.a>
    </div>
  );
};
export default FloatingActions;
