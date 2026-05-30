import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Filter, Eye, Sparkles, Play, Star, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';

interface UnifiedMediaItem {
  id: string;
  title: string;
  category: string;
  type: 'workout' | 'transformation' | 'video';
  imageUrl?: string;
  beforeUrl?: string;
  afterUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  createdAt: any;
}

export const Gallery: React.FC = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<UnifiedMediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Testimonial submission form state
  const [formClientName, setFormClientName] = useState<string>('');
  const [formAchievement, setFormAchievement] = useState<string>('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formReview, setFormReview] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formClientName.trim() || !formAchievement.trim() || !formReview.trim()) {
      showToast('Please fill out all fields before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    const testimonialId = 'test_' + Math.random().toString(36).substring(2, 12);

    try {
      await setDoc(doc(db, 'testimonials', testimonialId), {
        id: testimonialId,
        clientName: formClientName.trim(),
        achievement: formAchievement.trim(),
        rating: Math.round(formRating),
        review: formReview.trim(),
        createdAt: serverTimestamp(),
        approved: false,
      });

      showToast('Thank you! Your testimonial feedback has been recorded successfully.', 'success');
      setFormClientName('');
      setFormAchievement('');
      setFormRating(5);
      setFormReview('');
    } catch (err: any) {
      console.error('Error submitting testimonial:', err);
      showToast('Could not save testimonial. Please check database configuration and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['All', 'Weight Loss', 'Muscle Gain', 'Cardio', 'Strength Training'];

  // No default placeholder assets
  const samplePhotos: any[] = [];

  // No default placeholder videos
  const sampleVideos: any[] = [];

  useEffect(() => {
    async function fetchGalleryAndVideos() {
      setLoading(true);
      try {
        const galSnap = await getDocs(collection(db, 'gallery'));
        const listPhotos: UnifiedMediaItem[] = [];
        galSnap.forEach((doc) => {
          listPhotos.push({ id: doc.id, ...doc.data() } as UnifiedMediaItem);
        });

        const vidSnap = await getDocs(collection(db, 'videos'));
        const listVideos: UnifiedMediaItem[] = [];
        vidSnap.forEach((doc) => {
          const d = doc.data();
          listVideos.push({
            id: doc.id,
            title: d.title,
            category: d.category,
            type: 'video',
            videoUrl: d.videoUrl,
            thumbnailUrl: d.thumbnailUrl,
            description: d.description,
            createdAt: d.createdAt
          });
        });

        const merged = [...listPhotos, ...listVideos];
        if (merged.length > 0) {
          setItems(merged);
        } else {
          const sampleMerged: UnifiedMediaItem[] = [
            ...samplePhotos,
            ...sampleVideos.map(v => ({
              ...v,
              type: 'video' as const
            }))
          ];
          setItems(sampleMerged);
        }
      } catch (err) {
        console.warn('Could not sync gallery data from Firestore. Using high fidelity assets:', err);
        const sampleMerged: UnifiedMediaItem[] = [
          ...samplePhotos,
          ...sampleVideos.map(v => ({
            ...v,
            type: 'video' as const
          }))
        ];
        setItems(sampleMerged);
      } finally {
        setLoading(false);
      }
    }
    fetchGalleryAndVideos();
  }, []);

  const convertToYoutubeEmbed = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=0`;
    }
    return url;
  };

  // Filter logic
  const filteredItems = items.filter((item) => {
    return activeCategory === 'All' || item.category === activeCategory;
  });

  return (
    <div className="bg-[#070708] pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Block */}
        <div className="text-center mb-16">
          <span className="text-red-500 font-mono text-xs font-black tracking-widest uppercase">
            COACHING PORTFOLIO
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mt-2">
            ATHLETIC RECORDS & MASTERCLASSES
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto mt-4 text-xs sm:text-sm">
            Experience our comprehensive training protocols, step-by-step biomechanical video guides, and direct certified local transformation histories.
          </p>
        </div>

        {/* Dynamic Navigation/Filtering Bars */}
        <div className="flex flex-col gap-6 mb-12 border-y border-zinc-900/60 py-6">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-zinc-500 font-mono text-[10px] uppercase font-black mr-2 flex items-center gap-1">
              <Filter className="w-3 h-3 text-red-500" /> CATEGORIES:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-black tracking-widest border transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid items with Animation */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="block bg-zinc-950 h-96 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredItems.length === 0 ? (
                <div className="col-span-full py-20 text-center text-zinc-650 flex flex-col items-center justify-center">
                  <Play className="w-12 h-12 mb-3 text-zinc-800 border-2 border-dashed border-zinc-900 p-3 rounded-full" />
                  <p className="italic font-mono text-zinc-500 text-xs">No media assets found in this category.</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl hover:border-zinc-800 transition-colors flex flex-col justify-between"
                  id={`gallery-card-${item.id}`}
                >
                  {/* Photo or Video Panels */}
                  <div className="p-4">
                    {item.type === 'transformation' ? (
                      <div className="grid grid-cols-2 gap-2 relative">
                        {/* Before Panel */}
                        <div 
                          className="relative aspect-[3/4] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-900/40 cursor-pointer"
                          onClick={() => setSelectedPhoto(item.beforeUrl || null)}
                          title="Click to view full-size image"
                        >
                          <img
                            src={item.beforeUrl}
                            alt="Before state"
                            className="w-full h-full object-cover filter brightness-75 contrast-110"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-2.5 left-2.5 bg-black/85 font-mono text-[8px] font-black uppercase text-zinc-400 tracking-wider px-1.5 py-0.5 rounded">
                            BEFORE
                          </span>
                        </div>

                        {/* After Panel */}
                        <div 
                          className="relative aspect-[3/4] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-900/40 cursor-pointer"
                          onClick={() => setSelectedPhoto(item.afterUrl || null)}
                          title="Click to view full-size image"
                        >
                          <img
                            src={item.afterUrl}
                            alt="After state"
                            className="w-full h-full object-cover filter saturate-110"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-2.5 left-2.5 bg-red-600 font-mono text-[8px] font-black uppercase text-white tracking-widest px-1.5 py-0.5 rounded border border-red-500">
                            AFTER
                          </span>
                        </div>
                      </div>
                    ) : item.type === 'video' ? (
                      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden rounded-xl border border-zinc-900/45 group">
                        {playingId === item.id ? (
                          item.videoUrl.includes('youtube.com') || item.videoUrl.includes('youtu.be') ? (
                            <iframe
                              src={convertToYoutubeEmbed(item.videoUrl)}
                              title={item.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="w-full h-full rounded-xl"
                            />
                          ) : (
                            <video
                              src={item.videoUrl}
                              controls
                              autoPlay
                              className="w-full h-full object-contain rounded-xl"
                              referrerPolicy="no-referrer"
                            />
                          )
                        ) : (
                          <>
                            <img
                              src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop'}
                              alt={item.title}
                              className="w-full h-full object-cover opacity-60 hover:opacity-75 transition-opacity duration-300"
                              referrerPolicy="no-referrer"
                            />
                            {/* Play button overlay */}
                            <button
                              onClick={() => setPlayingId(item.id)}
                              id={`play-btn-${item.id}`}
                              className="absolute z-10 p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                              aria-label="Play video"
                            >
                              <Play className="w-6 h-6 fill-white ml-0.5" />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div 
                        className="relative aspect-[4/3] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-900/40 group cursor-pointer"
                        onClick={() => setSelectedPhoto(item.imageUrl || null)}
                        title="Click to view full-size image"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 saturate-105 contrast-105"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div 
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhoto(item.imageUrl || null);
                          }}
                        >
                          <div className="p-3 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors transform hover:scale-110 active:scale-95 duration-150 shadow-lg">
                            <Eye className="w-5 h-5 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-6 pb-6 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest font-mono">
                        {item.category}
                      </span>
                      <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full">
                        {item.type === 'transformation' ? 'SUCCESS STORY' : item.type === 'video' ? 'WORKOUT VIDEO' : 'WORKOUT TECHNIQUE'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-100">
                      {item.title}
                    </h3>
                    {item.type === 'video' && item.description && (
                      <p className="text-zinc-500 font-sans text-xs mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              )))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty Search Fallback */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-24 border border-dashed border-zinc-900 rounded-3xl mt-12 bg-zinc-950/20">
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
              No content matched active filter options.
            </p>
          </div>
        )}

        {/* Review Submission Section */}
        <div className="mt-24 pt-16 border-t border-zinc-900/60" id="gallery-review-section">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-red-500 font-mono text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-red-500" /> REVOLUTIONARY SATISFACTION
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tighter text-white mt-2">
                SUBMIT YOUR FEEDBACK
              </h2>
              <p className="text-zinc-500 mt-2 text-xs sm:text-sm">
                Share your journey, certified achievements, and structural training results with Mr. Delwin Jijo. Your submissions inspire the whole community.
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-6" id="testimonial-submission-form">
              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase font-black tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  className="w-full bg-[#0d0d0f] border border-zinc-900 focus:border-red-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-zinc-400 font-mono text-[10px] uppercase font-black tracking-widest mb-2">
                    Key Highlight / Achievement
                  </label>
                  <input
                    type="text"
                    required
                    value={formAchievement}
                    onChange={(e) => setFormAchievement(e.target.value)}
                    placeholder="e.g., Shredded 12kg or Lean Muscle"
                    className="w-full bg-[#0d0d0f] border border-zinc-900 focus:border-red-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono text-[10px] uppercase font-black tracking-widest mb-2">
                    Overall Satisfaction Rating
                  </label>
                  <div className="flex items-center gap-2 h-[46px] bg-[#0d0d0f] border border-zinc-900 rounded-xl px-4">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setFormRating(starVal)}
                        className="cursor-pointer transition-transform duration-100 hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            starVal <= formRating
                              ? 'fill-red-500 text-red-500'
                              : 'text-zinc-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-[10px] font-bold font-mono text-zinc-400 ml-auto select-none">
                      {formRating}.0 / 5.0
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase font-black tracking-widest mb-2">
                  Your Transformation Story & Core Experience
                </label>
                <textarea
                  required
                  rows={4}
                  value={formReview}
                  onChange={(e) => setFormReview(e.target.value)}
                  placeholder="Elaborate on Mr. Delwin Jijo's scientific diet, training program precision, and structural support..."
                  className="w-full bg-[#0d0d0f] border border-zinc-900 focus:border-red-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition-colors resize-none mb-2"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-black tracking-widest text-xs uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.25)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? 'RECORDING TRANSACTIONS...' : 'SUBMIT TESTIMONIAL FEEDBACK'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 text-white hover:text-red-500 bg-zinc-950 border border-zinc-900 rounded-full p-3 transition-colors cursor-pointer"
            >
              <span className="text-sm font-black font-mono">✕ CLOSE</span>
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={selectedPhoto}
              alt="Enlarged gallery view"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-zinc-900/60 shadow-2xl"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Gallery;
