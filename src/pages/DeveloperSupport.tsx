import React from 'react';
import { MessageCircle, Mail, Phone } from 'lucide-react';

export const DeveloperSupport: React.FC = () => {
  const developerPhone = '9345525709';
  const developerWhatsApp = '9345525709';
  const developerEmail = 'godwinjijo789@gmail.com';

  return (
    <div className="min-h-screen bg-black text-white px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Developer Support
          </h1>
          <p className="text-zinc-400 text-lg">
            Get in touch with the development team for any technical issues or inquiries
          </p>
        </div>

        {/* Support Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${developerWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-8 border border-zinc-800 rounded-lg hover:border-green-600 hover:bg-green-950/20 transition-all group cursor-pointer"
          >
            <MessageCircle className="w-12 h-12 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
            <p className="text-zinc-400 text-sm text-center mb-3">Chat with us on WhatsApp</p>
            <span className="text-green-500 font-mono font-bold">{developerWhatsApp}</span>
          </a>

          {/* Phone */}
          <a
            href={`tel:${developerPhone}`}
            className="flex flex-col items-center justify-center p-8 border border-zinc-800 rounded-lg hover:border-blue-600 hover:bg-blue-950/20 transition-all group cursor-pointer"
          >
            <Phone className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Call</h3>
            <p className="text-zinc-400 text-sm text-center mb-3">Call us directly</p>
            <span className="text-blue-500 font-mono font-bold">{developerPhone}</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:${developerEmail}`}
            className="flex flex-col items-center justify-center p-8 border border-zinc-800 rounded-lg hover:border-red-600 hover:bg-red-950/20 transition-all group cursor-pointer"
          >
            <Mail className="w-12 h-12 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Email</h3>
            <p className="text-zinc-400 text-sm text-center mb-3">Send us an email</p>
            <span className="text-red-500 font-mono font-bold break-all">{developerEmail}</span>
          </a>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 border border-zinc-800 rounded-lg bg-zinc-950/40">
          <h3 className="text-lg font-bold mb-3">Response Time</h3>
          <p className="text-zinc-400">
            We typically respond to support requests within 24 hours during business days. For urgent matters, please use WhatsApp or call us directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSupport;
