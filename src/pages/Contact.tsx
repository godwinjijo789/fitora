import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useToast } from '../context/ToastContext';
import { Mail, Phone, MapPin, Send, HelpCircle, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Contact: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    goal: '',
    message: ''
  });

  const [phone, setPhone] = useState('+91 73585 70962');
  const [email, setEmail] = useState('trainwithjijo@gmail.com');
  const [location, setLocation] = useState("Sholinganallur, Chennai, TamilNadu, India");
  const [web3FormsKey, setWeb3FormsKey] = useState<string>('');

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'homepageContent', 'home_singleton'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.contactPhone) setPhone(data.contactPhone);
          if (data.contactEmail) setEmail(data.contactEmail);
          if (data.contactLocation) setLocation(data.contactLocation);
          if (data.web3FormsKey) setWeb3FormsKey(data.web3FormsKey);
        }
      },
      (err) => {
        console.warn('Could not load real-time contacts:', err);
      }
    );
    return () => unsub();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Field basic validations
    if (!formData.name.trim() || !formData.mobile.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('All form fields are strictly mandatory.', 'error');
      return;
    }

    if (formData.mobile.length < 9) {
      showToast('Invalid Mobile Number. Use correct country prefix.', 'error');
      return;
    }

    setLoading(true);

    const enquiryId = 'enq_' + Math.random().toString(36).substring(2, 12);
    const collectionPath = 'enquiries';

    try {
      // 1. Save data to Firestore with serverTimestamp to accommodate rules validation
      const docRef = doc(db, collectionPath, enquiryId);
      const payload = {
        id: enquiryId,
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        goal: formData.goal,
        message: formData.message.trim(),
        timestamp: serverTimestamp() // Generates request.time synchronously
      };

      await setDoc(docRef, payload);

      // 2. Trigger automated Email Notification to admin
      const emailSubject = `New FitForce By Jijo Enquiry: ${formData.name.trim()}`;
      const emailBody = `Hi Coach Delwin,

A new coaching registration/enquiry has been submitted.

Lead Details:
• Name: ${formData.name.trim()}
• Mobile Number: ${formData.mobile.trim()}
• Email Address: ${formData.email.trim()}
• Fitness Goal: ${formData.goal.trim()}

Enquiry message:
"${formData.message.trim()}"`;

      // 2. Write to Firebase "mail" collection so the "Trigger Email" extension can process it
      try {
        const mailRef = doc(db, 'mail', enquiryId);
        await setDoc(mailRef, {
          to: email,
          message: {
            subject: emailSubject,
            text: emailBody
          },
          timestamp: serverTimestamp()
        });
        showToast('Enquiry successfully submitted and Coach will be notified!', 'success');
      } catch (mailError) {
        console.error('Failed to trigger email via Firebase mail collection:', mailError);
        showToast('Enquiry Submitted! Email delivery might be delayed.', 'success');
      }

      // Clear Form state
      setFormData({
        name: '',
        mobile: '',
        email: '',
        goal: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Enquiry submission fail:', error);
      try {
        handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${enquiryId}`);
      } catch (innerErr: any) {
        showToast('Enquiry Submission Failed. Contact Coach directly.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#070708] pt-12 pb-24 leading-relaxed font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Block */}
        <div className="text-center mb-16">
          <span className="text-red-500 font-mono text-xs font-black tracking-widest uppercase">
            REACH THE APEX
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mt-1">
            SCHEDULE A TRAINING TRIGGER
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto mt-4 text-xs sm:text-sm">
            Add your initial enquiry sheet today. Coach Mr. Delwin Jijo reviews every single inbound request personally within 24 business hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-12">
          {/* Column 1: Info block */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col gap-6">
              <h3 className="text-lg font-black tracking-wider text-white uppercase font-mono">
                COACHING HEADQUARTERS
              </h3>
              
              <div className="flex gap-4">
                <div className="p-3 bg-red-950/40 text-red-500 border border-red-900/40 rounded-xl h-fit">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-500 font-mono tracking-widest uppercase">PHONE DIAL</h4>
                  <p className="text-zinc-200 mt-1 font-bold text-sm">{phone}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-red-950/40 text-red-500 border border-red-900/40 rounded-xl h-fit">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-500 font-mono tracking-widest uppercase">WRITE EMAIL</h4>
                  <p className="text-zinc-200 mt-1 font-bold text-sm">
                    <a href={`mailto:${email}`} className="hover:text-red-500 transition-colors">{email}</a>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-red-950/40 text-red-500 border border-red-900/40 rounded-xl h-fit">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-500 font-mono tracking-widest uppercase">STRENGTH LAB LOCATION</h4>
                  <p className="text-zinc-400 mt-1 text-xs sm:text-sm leading-snug">
                    {location}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick trust assurances */}
            <div className="p-6 bg-red-950/20 border border-red-900/30 rounded-2xl flex gap-3">
              <CheckCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-white tracking-widest uppercase mb-1">
                  SECURE SUBMISSIONS
                </h4>
                <p className="text-xs text-zinc-400">
                  Your mobile digits and fitness profiles remains highly encrypted and invisible to third parties.
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Enquiry Form */}
          <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
            <h3 className="text-xl font-black text-white tracking-wider mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-red-600" /> ENQUIRY APPLICATION
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm" id="enquiry-booking-form">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-bold text-zinc-400 font-mono tracking-wider uppercase">
                  Your name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full bg-black/60 border border-zinc-900 rounded-xl px-4 py-3.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Mobile */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="mobile" className="text-xs font-bold text-zinc-400 font-mono tracking-wider uppercase">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    id="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+91 98765 00000"
                    required
                    className="w-full bg-black/60 border border-zinc-900 rounded-xl px-4 py-3.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-semibold"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-zinc-400 font-mono tracking-wider uppercase">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@gmail.com"
                    required
                    className="w-full bg-black/60 border border-zinc-900 rounded-xl px-4 py-3.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Goal Choice Input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="goal" className="text-xs font-bold text-zinc-400 font-mono tracking-wider uppercase">
                  Fitness Goal *
                </label>
                <input
                  type="text"
                  name="goal"
                  id="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  placeholder="e.g. Lose 10kg, build chest, increase VO2 max..."
                  required
                  className="w-full bg-black/60 border border-zinc-900 rounded-xl px-4 py-3.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-semibold"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-bold text-zinc-400 font-mono tracking-wider uppercase">
                  Enquiry Message *
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Outline your current fitness baseline, medical records, or target deadlines..."
                  required
                  className="w-full bg-black/60 border border-zinc-900 rounded-xl px-4 py-3.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-semibold resize-none"
                />
              </div>

              {/* Submit CTA */}
              <motion.button
                type="submit"
                disabled={loading}
                id="sumbit-enquiry-btn"
                className={`w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black tracking-widest text-xs uppercase rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_35px_rgba(220,38,38,0.6)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? 'TRANSMITTING SHEET...' : 'SUBMIT ENQUIRY REGISTRATION'} <Send className="w-4 h-4" />
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Contact;
