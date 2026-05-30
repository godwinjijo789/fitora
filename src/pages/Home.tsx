import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Users, Award, Zap, Trophy, ArrowRight, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../firebase';
import { GalleryItem, TestimonialItem } from '../types';
import { transformGoogleDriveUrl } from '../utils';
// @ts-ignore
import defaultCoachPortrait from '../assets/images/regenerated_image_1779896469247.png';

export const Home: React.FC = () => {
  const [transformations, setTransformations] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<TestimonialItem[]>([]);

  // Dynamic homepage states editable by admin
  const [heroTitle, setHeroTitle] = useState('TRAIN COMPROMISE NOT YET FREE');
  const [heroSubtitle, setHeroSubtitle] = useState('Ditch boilerplate routines. Mr. Delwin Jijo architects customized, evidence-based strength programs, nutritional architectures, and accountability templates engineered specifically for active high-achievers.');
  const [statsClientsCount, setStatsClientsCount] = useState('500+');
  const [statsExperienceYears, setStatsExperienceYears] = useState('3+ Years');
  const [statsWorkoutsTrained, setStatsWorkoutsTrained] = useState('15k+ Hrs');
  const [statsTransformationSuccess, setStatsTransformationSuccess] = useState('99%');
  const [highlightQuote, setHighlightQuote] = useState("True athleticism isn't about exhausting yourself in a single session. It is building an unbreakable structural baseline of power.");
  const [coachImageUrl, setCoachImageUrl] = useState("https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=600&auto=format&fit=crop");
  const [coachName, setCoachName] = useState("MR. DELWIN JIJO");
  const [coachBio, setCoachBio] = useState('For over three years, I have engineered custom transformations for executives, clients, and busy professionals. My training methodology breaks away from traditional "fat-burning" myths, substituting them with calculated energy balance protocols, progressive overload tracks, and customized neural adaptations that actually persist.');

  const stats = [
    { value: statsClientsCount, label: 'Clients Coached', icon: Users },
    { value: statsExperienceYears, label: 'Pro Experience', icon: Award },
    { value: statsWorkoutsTrained, label: 'Personalized Coaching', icon: Zap },
    { value: statsTransformationSuccess, label: 'Transformation Success', icon: Trophy },
  ];

  const defaultCategories = [
    {
      title: 'Muscle Gain',
      desc: 'Build high-volume lean mass, enhance myofibrillar density, and perfect raw lifts.',
      tag: 'Hypertrophy',
      img: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Weight Loss',
      desc: 'Optimize metabolic flexibility, shed fat deposits, and sustain long-term conditioning.',
      tag: 'Fat Loss',
      img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Strength Training',
      desc: 'Target maximal neurological adaptations, core power, and physical resilience.',
      tag: 'Powerlifting',
      img: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'High Cardio/HIIT',
      desc: 'Maximize VO2 peak, boost endurance thresholds, and ignite overall performance.',
      tag: 'Conditioning',
      img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=600&auto=format&fit=crop'
    }
  ];

  const sampleTransformations: GalleryItem[] = [
    {
      id: 'tf_1',
      title: 'David K. - 12 Week Core Rebuild',
      category: 'Weight Loss',
      type: 'transformation',
      beforeUrl: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=300&auto=format&fit=crop',
      afterUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300&auto=format&fit=crop',
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300&auto=format&fit=crop',
      createdAt: null
    },
    {
      id: 'tf_2',
      title: 'James S. - Bulk Pack Program',
      category: 'Muscle Gain',
      type: 'transformation',
      beforeUrl: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?q=80&w=300&auto=format&fit=crop',
      afterUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=300&auto=format&fit=crop',
      imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=300&auto=format&fit=crop',
      createdAt: null
    }
  ];

  const sampleTestimonials: TestimonialItem[] = [];

  useEffect(() => {
    // 1. Fetch Gallery and Testimonials
    async function fetchCollections() {
      try {
        const gallerySnap = await getDocs(query(collection(db, 'gallery'), limit(3)));
        const listItems: GalleryItem[] = [];
        gallerySnap.forEach((doc) => {
          if (doc.data().type === 'transformation') {
            listItems.push({ id: doc.id, ...doc.data() } as GalleryItem);
          }
        });
        if (listItems.length > 0) {
          setTransformations(listItems);
        } else {
          setTransformations(sampleTransformations);
        }

        const testimonialSnap = await getDocs(query(collection(db, 'testimonials'), limit(2)));
        const testItems: TestimonialItem[] = [];
        testimonialSnap.forEach((doc) => {
          const data = doc.data();
          if (data.approved === true) {
            testItems.push({ id: doc.id, ...data } as TestimonialItem);
          }
        });
        if (testItems.length > 0) {
          setReviews(testItems);
        } else {
          setReviews(sampleTestimonials);
        }
      } catch (err) {
        console.warn('Real-time sync failed. Carrying over fallbacks:', err);
        setTransformations(sampleTransformations);
        setReviews(sampleTestimonials);
      }
    }

    // 2. Fetch Home Singleton configuration copy
    async function fetchHomeConfig() {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const homeSnap = await getDoc(doc(db, 'homepageContent', 'home_singleton'));
        if (homeSnap.exists()) {
          const hData = homeSnap.data();
          if (hData.heroTitle) setHeroTitle(hData.heroTitle);
          if (hData.heroSubtitle) setHeroSubtitle(hData.heroSubtitle);
          if (hData.statsClientsCount) setStatsClientsCount(hData.statsClientsCount);
          if (hData.statsExperienceYears) setStatsExperienceYears(hData.statsExperienceYears);
          if (hData.statsWorkoutsTrained) setStatsWorkoutsTrained(hData.statsWorkoutsTrained);
          if (hData.highlightQuote) setHighlightQuote(hData.highlightQuote);
        }
      } catch (innerErr) {
        console.warn('Could not retrieve custom homepage configuration:', innerErr);
      }
    }

    // 3. Fetch dynamic coach profile
    async function fetchCoachProfile() {
      try {
        const trainersSnap = await getDocs(collection(db, 'trainers'));
        if (!trainersSnap.empty) {
          const profileData = trainersSnap.docs[0].data();
          if (profileData.imageUrl) setCoachImageUrl(profileData.imageUrl);
          if (profileData.name) {
            let name = profileData.name.toUpperCase().trim();
            if (name.endsWith(' COACH')) {
              name = name.slice(0, -6).trim();
            }
            setCoachName(name);
          }
          if (profileData.aboutText) setCoachBio(profileData.aboutText);
          
          if (profileData.statsClientsCount) setStatsClientsCount(profileData.statsClientsCount);
          if (profileData.statsExperienceYears) setStatsExperienceYears(profileData.statsExperienceYears);
          if (profileData.statsWorkoutsTrained) setStatsWorkoutsTrained(profileData.statsWorkoutsTrained);
          if (profileData.statsTransformationSuccess) setStatsTransformationSuccess(profileData.statsTransformationSuccess);
        }
      } catch (trainerErr) {
        console.warn('Could not retrieve dynamic coach/trainer details:', trainerErr);
      }
    }

    fetchCollections();
    fetchHomeConfig();
    fetchCoachProfile();
  }, []);

  return (
    <div className="bg-[#070708]">
      {/* 1. Hero Banner */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with rich filters */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1920&auto=format&fit=crop"
            alt="Pro Gym Workout"
            className="w-full h-full object-cover opacity-35 object-center scale-105 filter saturate-75 brightness-75 contrast-125 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070708] via-transparent to-[#070708]/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center justify-center text-center font-mono text-[9px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.25em] text-red-500 uppercase px-3 sm:px-4 py-1.5 bg-red-950/40 border border-red-900/40 rounded-full max-w-[95%]">
              ⚡ PROFESSIONAL ELITE STRENGTH COACH
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-6 text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-white uppercase text-balance"
          >
            {heroTitle.includes('NOT YET FREE') ? (
              <>
                TRAIN COMPROMISE<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-amber-500">
                  NOT YET FREE
                </span>
              </>
            ) : heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="mt-6 text-base sm:text-xl text-zinc-400 max-w-3xl mx-auto font-sans leading-relaxed text-balance"
          >
            {heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black tracking-widest text-xs uppercase rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.7)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              START TRANSFORMING NOW <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto px-8 py-4 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 font-extrabold tracking-widest text-xs uppercase rounded-lg transition-all"
            >
              EXPLORE METHODOLOGY
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Statistics Section */}
      <section className="relative z-20 py-16 bg-black border-y border-zinc-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center p-4">
                  <div className="p-3 bg-red-950/25 rounded-xl border border-red-900/30 text-red-500 mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                    {stat.value}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono tracking-wider uppercase mt-1">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Trainer Highlight section */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-900/60 leading-relaxed">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 relative">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-red-600/20 shadow-2xl relative group">
              <img
                src={(!coachImageUrl || coachImageUrl.includes('drive.google.com') || coachImageUrl.includes('photo-1568602471122-7832951cc4c5')) ? defaultCoachPortrait : transformGoogleDriveUrl(coachImageUrl)}
                alt="Trainer Mr. Delwin Jijo"
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            </div>
            {/* Athletic absolute badge */}
            <div className="absolute -bottom-6 -right-5 bg-red-600 text-white py-4 px-6 rounded-xl border border-red-500 shadow-xl font-sans text-center">
              <p className="text-2xl font-black tracking-tighter">{statsExperienceYears}</p>
              <p className="text-[10px] font-mono tracking-widest uppercase">Industry Pro</p>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-center">
            <span className="text-red-500 font-mono text-xs font-black tracking-widest uppercase">
              MEET HEALTH ARCHITECT
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mt-3">
              I AM COACH <span className="text-red-600">{coachName}</span>
            </h2>
            <p className="text-zinc-400 mt-6 text-sm sm:text-base leading-relaxed">
              {coachBio}
            </p>
            <blockquote className="border-l-4 border-red-600 pl-4 py-1.5 my-6 text-italic text-zinc-300 font-medium">
              "{highlightQuote}"
            </blockquote>
          </div>
        </div>
      </section>

      {/* 4. Testimonials Preview section */}
      <section className="py-24 bg-gradient-to-b from-[#070708] to-black border-t border-zinc-900/60 p-4">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <span className="text-[#dc2626] font-mono text-xs font-black tracking-widest uppercase mb-1">
            CLIENT ADVOCATES
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mt-2">
            CLIENT EXPERIENCES
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-900 rounded-2xl max-w-xl mx-auto">
            <p className="italic font-mono text-zinc-500 text-xs">No client reviews published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {reviews.map((test, index) => (
              <div
                key={index}
                className="p-6 bg-[#0c0c0e]/30 border border-zinc-900 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-1 text-red-500 mb-4 bg-zinc-950/40 w-fit px-2.5 py-1 rounded-full border border-zinc-900">
                    {[...Array(Math.max(1, Math.min(5, Number(test.rating) || 5)))].map((_, r_i) => (
                      <Star key={r_i} className="w-3" />
                    ))}
                    <span className="text-[10px] font-bold font-mono tracking-wider ml-1 text-zinc-300">
                      5.0 STAR REVIEW
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 italic leading-relaxed">
                    "{test.review}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-900/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wide">
                      {test.clientName}
                    </h4>
                    <p className="text-[10px] font-bold tracking-widest text-red-500 font-mono mt-0.5">
                      {test.achievement}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default Home;
