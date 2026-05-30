import React, { useState, useEffect } from 'react';
import { Award, ShieldAlert, CheckCircle, Flame, Mail, MapPin, Instagram, Dumbbell, Star, Calendar, Quote, Trophy, Phone, MessageSquare } from 'lucide-react';
import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { TrainerProfile, TestimonialItem } from '../types';
import { transformGoogleDriveUrl } from '../utils';
// @ts-ignore
import defaultCoachPortrait from '../assets/images/regenerated_image_1779896469247.png';

export const About: React.FC = () => {
  const defaultTrainer: TrainerProfile = {
    id: 'jijo_trainer',
    name: "Mr. Delwin Jijo",
    experience: "3+ Years Elite Coaching",
    aboutText: "Welcome! My name is Delwin Jijo, and I am the founder and head performance coach at FitForce By Jijo. For over three years, I have focused on dismantling typical corporate fitness misconceptions, replacing them with customized, periodized strength training models that generate permanent physical changes. My scientific programming model relies heavily on progressive resistance loads, metabolic triggers, and detailed macronutrient strategies that seamlessly align with high-tension schedules. Whether you are aiming to break personal lifting plateaus, lose stored fat mass sustainably, or rebuild raw functional stamina, I provide full professional accountability templates to guarantee elite status.",
    imageUrl: defaultCoachPortrait,
    instagramUrl: "https://instagram.com",
    contactEmail: "trainwithjijo@gmail.com",
    phone: "+91 98765 43210",
    whatsappNumber: "919876543210",
    location: "Padur, Kelambakkam, TamilNadu, India"
  };

  const [profile, setProfile] = useState<TrainerProfile>(defaultTrainer);
  const [reviews, setReviews] = useState<TestimonialItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);

  const sampleReviews: TestimonialItem[] = [];

  useEffect(() => {
    let latestTrainerData: any = null;
    let latestHomeData: any = null;

    const updateProfile = () => {
      let finalProfile = { ...defaultTrainer };
      if (latestTrainerData) {
        finalProfile = { ...finalProfile, ...latestTrainerData };
        if (finalProfile.name && finalProfile.name.endsWith(' Coach')) {
          finalProfile.name = finalProfile.name.slice(0, -6).trim();
        }
      }
      if (latestHomeData) {
        if (latestHomeData.contactEmail) finalProfile.contactEmail = latestHomeData.contactEmail;
        if (latestHomeData.contactPhone) finalProfile.phone = latestHomeData.contactPhone;
        if (latestHomeData.instagramUrl) finalProfile.instagramUrl = latestHomeData.instagramUrl;
        if (latestHomeData.whatsappNumber) finalProfile.whatsappNumber = latestHomeData.whatsappNumber;
        if (latestHomeData.contactLocation) finalProfile.location = latestHomeData.contactLocation;
      }
      setProfile(finalProfile);
    };

    // Listen to trainers collection (first document) in real-time
    const unsubTrainer = onSnapshot(
      collection(db, 'trainers'),
      (snap) => {
        if (!snap.empty) {
          latestTrainerData = { id: snap.docs[0].id, ...snap.docs[0].data() };
        } else {
          latestTrainerData = null;
        }
        updateProfile();
      },
      (err) => {
        console.warn('Could not subscribe to trainers collection:', err);
      }
    );

    // Listen to homepageContent singleton in real-time
    const unsubHome = onSnapshot(
      doc(db, 'homepageContent', 'home_singleton'),
      (docSnap) => {
        if (docSnap.exists()) {
          latestHomeData = docSnap.data();
        } else {
          latestHomeData = null;
        }
        updateProfile();
      },
      (err) => {
        console.warn('Could not subscribe to homepageContent:', err);
      }
    );

    // Subscribe to approved testimonials in real-time
    const unsubTest = onSnapshot(
      collection(db, 'testimonials'),
      (snapshot) => {
        const listItems: TestimonialItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.approved === true) {
            listItems.push({ id: docSnap.id, ...data } as TestimonialItem);
          }
        });
        setReviews(listItems);
        setLoadingReviews(false);
      },
      (err) => {
        console.warn('Could not load testimonials. Using empty state:', err);
        setReviews([]);
        setLoadingReviews(false);
      }
    );

    return () => {
      unsubTrainer();
      unsubHome();
      unsubTest();
    };
  }, []);

  return (
    <div className="bg-[#070708] pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card & Bio Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20 leading-relaxed">
          {/* Column 1: Image container */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-900 shadow-2xl group">
              <img
                src={(!profile.imageUrl || profile.imageUrl.includes('drive.google.com') || profile.imageUrl.includes('photo-1568602471122-7832951cc4c5') || profile.imageUrl === '') ? defaultCoachPortrait : transformGoogleDriveUrl(profile.imageUrl)}
                alt={profile.name}
                className="w-full h-full object-cover saturate-110 brightness-95 transform group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-col">
                <span className="text-red-500 font-mono text-[10px] font-black tracking-widest uppercase">
                  ACTIVE FITNESS ADVISOR
                </span>
                <h1 className="text-3xl font-black tracking-tight text-white mt-1 about-hero-heading">
                  {profile.name}
                </h1>
              </div>
            </div>

            {/* Coach Quick Contacts Card */}
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl">
              <h3 className="text-sm font-black tracking-widest text-white uppercase font-mono mb-4">
                COACH CHANNELS
              </h3>
              <div className="space-y-4 text-xs font-medium text-zinc-400">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>{profile.contactEmail}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>{profile.location || "Padur, Kelambakkam, TamilNadu, India"}</span>
                </div>
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center gap-3 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Phone className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>Call: {profile.phone}</span>
                  </a>
                )}
                {profile.instagramUrl && (
                  <a
                    href={profile.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Instagram className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>Follow @FitForceByJijo</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Full Profile Details */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div>
              <span className="text-red-500 font-mono text-xs font-black tracking-widest uppercase">
                PROFESSIONAL BIOGRAPHY
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mt-2">
                RECONSTRUCTING COGNITIVE FORCE
              </h2>
            </div>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {profile.aboutText}
            </p>
          </div>
        </div>

        {/* Client Reviews Section embedded in About instead of removed lists */}
        <div className="mt-16 border-t border-zinc-900 pt-16">
          <div className="text-center mb-12">
            <span className="text-red-500 font-mono text-xs font-black tracking-widest uppercase">
              TRUSTED CLIENT FUTURES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mt-2">
              CLIENT REVIEWS & RESULTS
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto mt-4 text-xs sm:text-sm">
              Real accounts from professionals and clients who completely reconstructed their athletic abilities with Mr. Delwin Jijo.
            </p>
          </div>

          {/* Reviews Grid */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-900 rounded-2xl max-w-2xl mx-auto">
              <p className="italic font-mono text-zinc-500 text-xs">No approved client reviews found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {reviews.map((test) => (
                <div
                  key={test.id}
                  className="relative p-8 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all duration-300 shadow-xl group"
                  id={`testimonial-card-${test.id}`}
                >
                  {/* Background quote decoration */}
                  <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 text-red-500 transition-opacity">
                    <Quote className="w-16 h-16" />
                  </div>

                  <div className="relative z-10">
                    {/* Rating Badge */}
                    <div className="flex items-center gap-1 text-red-500 mb-6 bg-zinc-950/40 w-fit px-3 py-1 border border-zinc-900 rounded-md">
                      {[...Array(Math.max(1, Math.min(5, Number(test.rating) || 5)))].map((_, r_i) => (
                        <Star key={r_i} className="w-3.5 h-3.5 fill-red-500" />
                      ))}
                      <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-400 ml-1.5 uppercase">
                        VERIFIED REVIEWS
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-zinc-300 italic font-sans leading-relaxed">
                      "{test.review}"
                    </p>
                  </div>

                  {/* Foot/Client Signature info */}
                  <div className="mt-8 pt-6 border-t border-zinc-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red-950/40 text-red-500 border border-red-900/40 rounded-xl">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                          {test.clientName}
                        </h3>
                        <p className="text-[10px] sm:text-xs font-bold tracking-widest font-mono text-red-500 mt-0.5">
                          {test.achievement}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Retention Stats */}
          <div className="mt-16 p-8 sm:p-12 bg-zinc-950 border border-zinc-900 rounded-3xl text-center max-w-4xl mx-auto">
            <span className="text-red-500 font-mono text-[9px] font-black tracking-widest uppercase mb-1">
              VERIFIED SUCCESS SCORE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">98% Retention Success</h2>
            <p className="text-zinc-500 text-xs sm:text-sm mt-3 leading-relaxed max-w-xl mx-auto">
              Our clients stay because FitForce By Jijo designs functional regimes that fit their high-intensity, demanding lifestyle. Programs aren't punishment—they are sustainable solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
