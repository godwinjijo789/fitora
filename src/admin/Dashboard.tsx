import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Dumbbell,
  FileText,
  Trash2,
  LogOut,
  BarChart3,
  Edit2,
  Save,
  Check,
  ChevronRight,
  Image,
  Video,
  Plus,
  Phone,
  Mail,
  MapPin,
  Instagram,
  MessageSquare,
  Star,
  Upload,
  X,
  User
} from 'lucide-react';
import { Enquiry, HomepageContent } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { FitoraLogo } from '../components/FitoraLogo';
import { transformGoogleDriveUrl } from '../utils';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'stats' | 'enquiries' | 'homepage' | 'gallery' | 'contact' | 'reviews' | 'coach'>('stats');

  // Coach/Trainer dynamic profile states
  const [coachProfile, setCoachProfile] = useState<any>({
    id: 'jijo_trainer',
    name: 'Mr. Delwin Jijo Coach',
    experience: '3+ Years Elite Strength Coaching',
    aboutText: 'Welcome! My name is Delwin Jijo R. K, and I am the founder and head performance coach at FITORA. For nearly a decade, I have focused on dismantling typical corporate fitness misconceptions, replacing them with customized, periodized strength training models that generate permanent physical changes.',
    imageUrl: ''
  });

  // Real-time states
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [homeConfigs, setHomeConfigs] = useState<HomepageContent>({
    id: 'home_singleton',
    heroTitle: 'TRAIN COMPROMISE NOT YET FREE',
    heroSubtitle: 'Ditch boilerplate routines. Mr. Delwin Jijo architects customized, evidence-based strength programs.',
    statsClientsCount: '20+',
    statsExperienceYears: '3+ Years',
    statsWorkoutsTrained: '5k+ Hrs',
    highlightQuote: 'True athleticism isn\'t about exhausting yourself in a single session.',
    contactPhone: '+91 7358570962',
    contactEmail: 'trainwithjijo@gmail.com',
    contactLocation: "Padur, Kelambakkam, TamilNadu, India",
    instagramUrl: 'https://instagram.com/jijo',
    whatsappNumber: '+91 73585 70962',
    web3FormsKey: ''
  });

  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // Add Photo states (Optimized for single image upload & custom categories)
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState<string>('Strength Training');
  const [customCategory, setCustomCategory] = useState('');
  const [photoImageUrl, setPhotoImageUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Add Video states
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState('Strength Training');
  const [videoCustomCategory, setVideoCustomCategory] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDescription, setVideoDescription] = useState('');

  // Inline Editing states for Photos
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');
  const [editPhotoCategory, setEditPhotoCategory] = useState('Strength Training');
  const [editPhotoCustomCategory, setEditPhotoCustomCategory] = useState('');
  const [editPhotoImageUrl, setEditPhotoImageUrl] = useState('');

  // Inline Editing states for Videos
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoCategory, setEditVideoCategory] = useState('Strength Training');
  const [editVideoCustomCategory, setEditVideoCustomCategory] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editVideoDescription, setEditVideoDescription] = useState('');

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerConfirm = (title: string, message: string, actionLabel: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      actionLabel,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      }
    });
  };

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      showToast('No file selected.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image is too large. Please select an image under 5MB.', 'error');
      return;
    }
    try {
      showToast('Uploading image to storage...', 'info');
      const fileRef = ref(storage, `gallery/edit_${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setEditPhotoImageUrl(url);
      showToast('Image uploaded successfully.', 'success');
    } catch (err: any) {
      console.error('Edit photo upload error:', err);
      showToast(`Image upload failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleCoachPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      showToast('No file selected.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image is too large. Please select an image under 5MB.', 'error');
      return;
    }
    try {
      showToast('Uploading coach photo to storage...', 'info');
      const fileRef = ref(storage, `coach/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setCoachProfile((prev: any) => ({ ...prev, imageUrl: url }));
      showToast('Coach photo uploaded. Press Save to synchronize.', 'success');
    } catch (err: any) {
      console.error('Coach photo upload error:', err);
      showToast(`Coach photo upload failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      e.target.value = '';
    }
  };

  // Synchronize Firestore collections in complete real-time with onSnapshot as mandated
  useEffect(() => {
    // 1. Enquiries real-time listener
    const unsubEnq = onSnapshot(
      collection(db, 'enquiries'),
      (snapshot) => {
        const list: Enquiry[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Enquiry);
        });
        // Sort newest timestamp first
        list.sort((a, b) => {
          const tA = a.timestamp?.seconds || 0;
          const tB = b.timestamp?.seconds || 0;
          return tB - tA;
        });
        setEnquiries(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'enquiries');
      }
    );

    // 2. Homepage Content real-time listener
    const unsubHome = onSnapshot(
      collection(db, 'homepageContent'),
      (snapshot) => {
        if (!snapshot.empty) {
          const configDoc = snapshot.docs[0];
          const data = configDoc.data();
          setHomeConfigs({
            id: configDoc.id,
            heroTitle: data.heroTitle || 'TRAIN COMPROMISE NOT YET FREE',
            heroSubtitle: data.heroSubtitle || 'Ditch boilerplate routines. Mr. Delwin Jijo architects customized, evidence-based strength programs.',
            statsClientsCount: data.statsClientsCount || '20+',
            statsExperienceYears: data.statsExperienceYears || '3+ Years',
            statsWorkoutsTrained: data.statsWorkoutsTrained || '15k+ Hrs',
            highlightQuote: data.highlightQuote || 'True athleticism isn\'t about exhausting yourself in a single session.',
            contactPhone: data.contactPhone || '+91 7358570762',
            contactEmail: data.contactEmail || 'trainwithjijo@gmail.com',
            contactLocation: data.contactLocation || "Kelambakkam, TamilNadu, India",
            instagramUrl: data.instagramUrl || 'https://instagram.com/jijo',
            whatsappNumber: data.whatsappNumber || '+91 73585 70762',
            web3FormsKey: data.web3FormsKey || ''
          } as HomepageContent);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'homepageContent');
      }
    );

    // 3. Gallery real-time listener
    const unsubGal = onSnapshot(
      collection(db, 'gallery'),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setGalleryPhotos(list);
      },
      (error) => {
        console.error('Gallery sync error:', error);
      }
    );

    // 4. Videos real-time listener
    const unsubVid = onSnapshot(
      collection(db, 'videos'),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setGalleryVideos(list);
      },
      (error) => {
        console.error('Videos sync error:', error);
      }
    );

    // 5. Testimonials/Reviews real-time listener
    const unsubTest = onSnapshot(
      collection(db, 'testimonials'),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setTestimonials(list);
      },
      (error) => {
        console.error('Testimonials sync error:', error);
      }
    );

    // 6. Trainers real-time listener
    const unsubTrainer = onSnapshot(
      collection(db, 'trainers'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          const data = docSnap.data();
          setCoachProfile({
            id: docSnap.id,
            name: data.name || 'Mr. Delwin Jijo Coach',
            experience: data.experience || '3+ Years Elite Coaching',
            aboutText: data.aboutText || 'Welcome! My name is Delwin Jijo, and I am the founder and head performance coach at FITORA.',
            imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=800&auto=format&fit=crop'
          });
        }
      },
      (error) => {
        console.error('Trainers sync error:', error);
      }
    );

    return () => {
      unsubEnq();
      unsubHome();
      unsubGal();
      unsubVid();
      unsubTest();
      unsubTrainer();
    };
  }, []);

  // Deletion helper
  const handleDeleteEnquiry = (id: string) => {
    const path = `enquiries/${id}`;
    triggerConfirm(
      'Discard Lead Record',
      'Are you sure you want to permanently discard this lead from your historical registers? This action is irreversible.',
      'Discard Lead',
      async () => {
        try {
          await deleteDoc(doc(db, 'enquiries', id));
          showToast(`Client lead enquiries removed fully.`, 'info');
        } catch (err: any) {
          showToast(`Removal failed: ${err.message || err}`, 'error');
          try {
            handleFirestoreError(err, OperationType.DELETE, path);
          } catch (innerErr) {
            console.error(innerErr);
          }
        }
      }
    );
  };

  // Edit Homepage configuration content
  const handleSaveHome = async () => {
    try {
      await setDoc(doc(db, 'homepageContent', homeConfigs.id), homeConfigs);
      showToast('Homepage and contact details updated successfully!', 'success');
    } catch (err: any) {
      showToast(`Homepage edit failed: ${err.message}`, 'error');
    }
  };

  const handleSaveCoachProfile = async () => {
    try {
      const payload = {
        id: 'jijo_trainer',
        name: coachProfile.name || 'Mr. Delwin Jijo',
        experience: coachProfile.experience || '3+ Years Elite Strength Coaching',
        aboutText: coachProfile.aboutText || '',
        imageUrl: coachProfile.imageUrl || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=800&auto=format&fit=crop',
        statsClientsCount: coachProfile.statsClientsCount || '20+',
        statsExperienceYears: coachProfile.statsExperienceYears || '3+ Years',
        statsWorkoutsTrained: coachProfile.statsWorkoutsTrained || '5k+ Hrs',
        statsTransformationSuccess: coachProfile.statsTransformationSuccess || '99%'
      };
      await setDoc(doc(db, 'trainers', 'jijo_trainer'), payload);
      showToast('Coach Profile successfully updated and synchronized.', 'success');
    } catch (err: any) {
      showToast(`Saving Coach Profile failed: ${err.message}`, 'error');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      showToast('No file selected.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image is too large. Please select an image under 5MB.', 'error');
      return;
    }
    try {
      setIsUploadingPhoto(true);
      showToast('Uploading image to Firebase Storage...', 'info');
      const fileRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setPhotoImageUrl(url);
      showToast('Image uploaded successfully! Now click UPLOAD & PUBLISH button.', 'success');
    } catch (err: any) {
      console.error('Upload error:', err);
      showToast(`Image upload failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Photo submission handler (Custom Category + Base64 image Upload)
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = photoCategory === 'Others' ? customCategory.trim() : photoCategory;
    
    if (!photoTitle.trim()) {
      showToast('Photo title is required!', 'error');
      return;
    }
    if (!finalCategory) {
      showToast('Category is required! Please specify a category name.', 'error');
      return;
    }
    if (!photoImageUrl) {
      showToast('Please upload or select an image first.', 'error');
      return;
    }

    try {
      const generatedId = 'gal_' + Date.now();
      const payload = {
        id: generatedId,
        title: photoTitle.trim(),
        category: finalCategory,
        type: 'workout',
        imageUrl: photoImageUrl,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'gallery', generatedId), payload);
      showToast('New photo successfully uploaded to your coaching gallery.', 'success');
      
      // Clear form inputs
      setPhotoTitle('');
      setPhotoImageUrl('');
      setCustomCategory('');
      setPhotoCategory('Strength Training');
    } catch (err: any) {
      showToast(`Adding photo failed: ${err.message}`, 'error');
    }
  };

  // Inline Photo edit helpers
  const startEditPhoto = (photo: any) => {
    setEditingPhotoId(photo.id);
    setEditPhotoTitle(photo.title);
    if (['Strength Training', 'Muscle Gain', 'Weight Loss'].includes(photo.category)) {
      setEditPhotoCategory(photo.category);
      setEditPhotoCustomCategory('');
    } else {
      setEditPhotoCategory('Others');
      setEditPhotoCustomCategory(photo.category);
    }
    setEditPhotoImageUrl(photo.imageUrl);
  };

  const handleSavePhotoEdit = async (id: string) => {
    if (!editPhotoTitle.trim()) {
      showToast('Title is required!', 'error');
      return;
    }
    const finalCategory = editPhotoCategory === 'Others' ? editPhotoCustomCategory.trim() : editPhotoCategory;
    if (!finalCategory) {
      showToast('Category is required!', 'error');
      return;
    }
    try {
      await updateDoc(doc(db, 'gallery', id), {
        title: editPhotoTitle.trim(),
        category: finalCategory,
        imageUrl: editPhotoImageUrl,
      });
      showToast('Gallery photo updated successfully!', 'success');
      setEditingPhotoId(null);
    } catch (err: any) {
      showToast(`Update failed: ${err.message}`, 'error');
    }
  };

  // Inline Video edit helpers
  const startEditVideo = (video: any) => {
    setEditingVideoId(video.id);
    setEditVideoTitle(video.title);
    if (['Strength Training', 'Muscle Gain', 'Weight Loss'].includes(video.category)) {
      setEditVideoCategory(video.category);
      setEditVideoCustomCategory('');
    } else {
      setEditVideoCategory('Others');
      setEditVideoCustomCategory(video.category || '');
    }
    setEditVideoUrl(video.videoUrl);
    setEditVideoDescription(video.description || '');
  };

  const handleSaveVideoEdit = async (id: string) => {
    if (!editVideoTitle.trim() || !editVideoUrl.trim()) {
      showToast('Title and URL are required!', 'error');
      return;
    }
    const finalCategory = editVideoCategory === 'Others' ? editVideoCustomCategory.trim() : editVideoCategory;
    if (!finalCategory) {
      showToast('Custom video category is required!', 'error');
      return;
    }
    try {
      await updateDoc(doc(db, 'videos', id), {
        title: editVideoTitle.trim(),
        category: finalCategory,
        videoUrl: editVideoUrl.trim(),
        description: editVideoDescription.trim()
      });
      showToast('Gallery video updated successfully!', 'success');
      setEditingVideoId(null);
    } catch (err: any) {
      showToast(`Update failed: ${err.message}`, 'error');
    }
  };

  // Toggle user-submitted review approval status dynamically
  const handleToggleApproveReview = async (id: string, currentStatus: boolean) => {
    try {
      const docRef = doc(db, 'testimonials', id);
      await updateDoc(docRef, { approved: !currentStatus });
      showToast(
        !currentStatus 
          ? 'Feedback approved! It will now be displayed under Public Reviews.' 
          : 'Feedback unapproved. It has been hidden from public viewing.',
        'success'
      );
    } catch (err: any) {
      showToast(`Review approval change failed: ${err.message}`, 'error');
    }
  };

  const handleDeleteReview = (id: string) => {
    triggerConfirm(
      'Delete Testimonial Review',
      'Are you sure you want to permanently delete this testimonial review? It will be removed from your website immediately.',
      'Delete Review',
      async () => {
        try {
          await deleteDoc(doc(db, 'testimonials', id));
          showToast('Testimonial deleted successfully.', 'info');
        } catch (err: any) {
          showToast(`Deletion failed: ${err.message}`, 'error');
        }
      }
    );
  };

  // Video submission handler
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) {
      showToast('Title and YouTube URL are required!', 'error');
      return;
    }

    // Function to extract video thumbnail automatically from YouTube
    const extractYoutubeThumbnail = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
      }
      return 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop';
    };

    const finalCategory = videoCategory === 'Others' ? videoCustomCategory.trim() : videoCategory;
    if (!finalCategory) {
      showToast('Custom video category is required!', 'error');
      return;
    }

    try {
      const generatedId = 'vid_' + Date.now();
      const payload = {
        id: generatedId,
        title: videoTitle.trim(),
        category: finalCategory,
        videoUrl: videoUrl.trim(),
        description: videoDescription.trim(),
        thumbnailUrl: extractYoutubeThumbnail(videoUrl.trim()),
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'videos', generatedId), payload);
      showToast('New video successfully appended to Coaching Gallery.', 'success');
      setVideoTitle('');
      setVideoUrl('');
      setVideoDescription('');
      setVideoCustomCategory('');
    } catch (err: any) {
      showToast(`Adding video failed: ${err.message}`, 'error');
    }
  };

  const handleDeletePhoto = (id: string) => {
    triggerConfirm(
      'Delete Gallery Photo',
      'Are you sure you want to permanently delete this photo from your coaching gallery?',
      'Delete Photo',
      async () => {
        try {
          await deleteDoc(doc(db, 'gallery', id));
          showToast('Photo removed successfully.', 'info');
        } catch (err: any) {
          showToast(`Photo deletion failed: ${err.message}`, 'error');
        }
      }
    );
  };

  const handleDeleteVideo = (id: string) => {
    triggerConfirm(
      'Delete Gallery Video',
      'Are you sure you want to permanently delete this video from your coaching gallery?',
      'Delete Video',
      async () => {
        try {
          await deleteDoc(doc(db, 'videos', id));
          showToast('Video removed successfully.', 'info');
        } catch (err: any) {
          showToast(`Video deletion failed: ${err.message}`, 'error');
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#070708] text-[#e4e4e7] flex flex-col md:flex-row leading-relaxed font-sans select-none">
      
      {/* Tab/Sidebar segment */}
      <aside className="w-full md:w-64 bg-black border-r border-zinc-900 flex flex-col p-6 gap-6 md:min-h-screen flex-shrink-0">
        <div className="flex items-center gap-2 pb-6 border-b border-zinc-900">
          <FitoraLogo iconClassName="w-10 h-10" showText={false} />
          <div>
            <h1 className="text-sm font-black tracking-tighter text-white">FITORA ADMIN</h1>
            <p className="text-[9px] font-mono tracking-widest text-[#dc2626] uppercase">Active Session</p>
          </div>
        </div>

        {/* Tab triggers */}
        <nav className="flex flex-col gap-2 flex-grow">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === 'stats' ? 'bg-red-600 text-white shadow-lg shadow-red-950/30' : 'text-zinc-400 hover:bg-zinc-90 w-full text-left'
            }`}
          >
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            PANEL STATS
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all relative ${
              activeTab === 'enquiries' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-950 text-left'
            }`}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>INBOUND LEADS</span>
            {enquiries.length > 0 && (
              <span className="absolute right-4 bg-zinc-900 border border-zinc-800 text-red-500 text-[9px] font-mono px-1.5 py-0.5 rounded">
                {enquiries.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('homepage')}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === 'homepage' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-950 text-left'
            }`}
          >
            <Edit2 className="w-4 h-4 flex-shrink-0" />
            HOME COPY
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === 'gallery' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-950 text-left'
            }`}
          >
            <Image className="w-4 h-4 flex-shrink-0" />
            GALLERY MANAGER
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all relative ${
              activeTab === 'reviews' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-950 text-left'
            }`}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span>REVIEWS MANAGER</span>
            {testimonials.length > 0 && (
              <span className="absolute right-4 bg-zinc-900 border border-zinc-800 text-red-500 text-[9px] font-mono px-1.5 py-0.5 rounded">
                {testimonials.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === 'contact' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-950 text-left'
            }`}
          >
            <Phone className="w-4 h-4 flex-shrink-0" />
            CONTACT EDITOR
          </button>

          <button
            onClick={() => setActiveTab('coach')}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === 'coach' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-950 text-left'
            }`}
          >
            <User className="w-4 h-4 flex-shrink-0" />
            COACH PORTRAIT
          </button>
        </nav>

        {/* Security logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-red-950/40 border border-transparent hover:border-red-900/40 rounded-xl transition-all leading-tight text-left cursor-pointer mt-auto"
        >
          <LogOut className="w-4 h-4" />
          Secure Exit
        </button>
      </aside>

      {/* Main Admin Console Panels Container */}
      <main className="flex-grow p-6 sm:p-10 select-none overflow-x-hidden">
        
        {/* Active Tab: Analytics and quick snapshots */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-8">
            <div>
              <span className="text-red-500 font-mono text-[10px] font-black tracking-widest uppercase mb-1">
                SNAP STATISTICS
              </span>
              <h2 className="text-3xl font-black text-white">FITORA OVERVIEW</h2>
            </div>

            {/* Snapshot cards container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-zinc-500 uppercase">Total Leads Received</p>
                  <p className="text-3xl font-bold font-mono text-white mt-1">{enquiries.length}</p>
                </div>
                <div className="p-3 bg-red-950/40 text-red-500 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-zinc-500 uppercase">Retention Streak</p>
                  <p className="text-3xl font-bold font-mono text-white mt-1">98%</p>
                </div>
                <div className="p-3 bg-red-950/40 text-red-500 rounded-xl">
                  <Check className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick action triggers */}
            <div className="p-6 bg-zinc-950 border border-zinc-900/60 rounded-2xl max-w-4xl">
              <h3 className="text-base font-black text-white uppercase mb-3 font-mono">
                TRAINER SESSION LOGGED DETAILS
              </h3>
              <p className="text-zinc-500 text-xs text-balance">
                You are currently logged in securely as: <span className="font-bold text-red-500">{user?.email}</span>. Every write or media operation takes place under your verified signature which is thoroughly vetted against real-time rules.
              </p>
            </div>
          </div>
        )}

        {/* Active Tab: Inquiries database table viewer with onSnapshot */}
        {activeTab === 'enquiries' && (
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-red-500 font-mono text-[10px] font-black tracking-widest uppercase mb-1">
                REAL-TIME STREAMING LEADS
              </span>
              <h2 className="text-3xl font-black text-white">CUSTOMER ENQUIRIES</h2>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead>
                    <tr className="bg-black text-zinc-500 border-b border-zinc-900 font-mono">
                      <th className="p-4 uppercase tracking-wider">Applicant & Details</th>
                      <th className="p-4 uppercase tracking-wider">Goal Focus</th>
                      <th className="p-4 uppercase tracking-wider">Enquiry Message</th>
                      <th className="p-4 uppercase tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-zinc-600 font-bold">
                          No customer enquiries found.
                        </td>
                      </tr>
                    ) : (
                      enquiries.map((enq) => (
                        <tr key={enq.id} className="border-b border-zinc-900 hover:bg-zinc-950/20 transition-all">
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-white uppercase">{enq.name}</span>
                              <span className="text-zinc-500 font-mono mt-1">Ph: {enq.mobile}</span>
                              <span className="text-zinc-500 font-mono">{enq.email}</span>
                            </div>
                          </td>
                          <td className="p-4 focus-visible:outline-none">
                            <span className="px-2.5 py-1 bg-red-950/30 border border-red-900/40 text-red-500 text-[10px] font-bold font-mono uppercase rounded-md">
                              {enq.goal}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="text-zinc-300 text-xs font-mono max-w-sm whitespace-pre-wrap leading-relaxed">
                              {enq.message}
                            </p>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteEnquiry(enq.id)}
                              className="p-2 border border-zinc-900 hover:border-red-950 text-zinc-600 hover:text-red-500 bg-black/40 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider"
                              title="Discard Lead Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Active Tab: Page Content Customization */}
        {activeTab === 'homepage' && (
          <div className="flex flex-col gap-8">
            <div>
              <span className="text-red-500 font-mono text-[10px] font-black tracking-widest uppercase mb-1">
                METADATA MANAGEMENT PANEL
              </span>
              <h2 className="text-3xl font-black text-white">CUSTOM HOMEPAGE COPY</h2>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Banner Headline *</label>
                  <input
                    type="text"
                    value={homeConfigs.heroTitle}
                    onChange={(e) => setHomeConfigs({ ...homeConfigs, heroTitle: e.target.value })}
                    className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 text-sm font-black"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Banner Description Sentence *</label>
                  <textarea
                    value={homeConfigs.heroSubtitle}
                    onChange={(e) => setHomeConfigs({ ...homeConfigs, heroSubtitle: e.target.value })}
                    rows={3}
                    className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 resize-none font-medium text-sm leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Highlight Philosophy Quote *</label>
                  <input
                    type="text"
                    value={homeConfigs.highlightQuote}
                    onChange={(e) => setHomeConfigs({ ...homeConfigs, highlightQuote: e.target.value })}
                    className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 italic font-semibold text-sm"
                  />
                </div>
              </div>

              {/* Statistics Counters mapping */}
              <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-900 pt-6 md:pt-0 md:pl-6 gap-4">
                <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest font-mono">HOMEPAGE CORE COUNTERS</h4>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-semibold text-zinc-400">Clients</label>
                      <input
                        type="text"
                        value={homeConfigs.statsClientsCount}
                        onChange={(e) => setHomeConfigs({ ...homeConfigs, statsClientsCount: e.target.value })}
                        className="bg-black border border-zinc-900 px-2 py-2 rounded text-zinc-200 text-center font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-semibold text-zinc-400">Experience</label>
                      <input
                        type="text"
                        value={homeConfigs.statsExperienceYears}
                        onChange={(e) => setHomeConfigs({ ...homeConfigs, statsExperienceYears: e.target.value })}
                        className="bg-black border border-zinc-900 px-2 py-2 rounded text-zinc-200 text-center font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-semibold text-zinc-400">Workouts Trained</label>
                      <input
                        type="text"
                        value={homeConfigs.statsWorkoutsTrained}
                        onChange={(e) => setHomeConfigs({ ...homeConfigs, statsWorkoutsTrained: e.target.value })}
                        className="bg-black border border-zinc-900 px-2 py-2 rounded text-zinc-200 text-center font-bold"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveHome}
                  className="w-full mt-4 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/40"
                >
                  <Save className="w-4.5 h-4.5" /> SAVE PORTAL METADATA CHANGES
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Tab: Gallery Manager */}
        {activeTab === 'gallery' && (
          <div className="flex flex-col gap-8 max-w-6xl">
            <div>
              <span className="text-red-500 font-mono text-[10px] font-black tracking-widest uppercase mb-1">
                MEDIA DEPOSIT CONSOLE
              </span>
              <h2 className="text-3xl font-black text-white">MANAGE PORTFOLIO GALLERY</h2>
              <p className="text-zinc-500 text-xs mt-1">
                Upload raw training photos or embed muscle-building instructional YouTube guides instantly into the public coaching gallery.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs font-semibold">
              {/* Form 1: Add Photo (Base64 file uploader + dynamic category selection) */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-between">
                <form onSubmit={handleAddPhoto} className="flex flex-col gap-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-zinc-900 pb-3">
                    <Image className="w-4 h-4 text-red-500" /> DEPOSIT TRAINING PHOTO
                  </h3>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Photo Title *</label>
                    <input
                      type="text"
                      required
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      placeholder="e.g. Back Lat Barbell Row Technique"
                      className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 outline-none focus:border-red-600/50"
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Category *</label>
                      <select
                        value={photoCategory}
                        onChange={(e) => setPhotoCategory(e.target.value)}
                        className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 leading-tight outline-none focus:border-red-600/50"
                      >
                        <option value="Strength Training">Strength Training</option>
                        <option value="Muscle Gain">Muscle Gain</option>
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    {photoCategory === 'Others' && (
                      <div className="flex flex-col gap-1 animate-fadeIn">
                        <label className="text-[10px] text-red-500 uppercase tracking-wider font-mono">Enter Custom Category Name *</label>
                        <input
                          type="text"
                          required
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="e.g. Yoga and Stretch, Calisthenics"
                          className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 outline-none focus:border-red-600/50"
                        />
                      </div>
                    )}
                  </div>

                  {/* Formatted Responsive File Uploader Zone */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Upload Image *</span>
                    {photoImageUrl ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800">
                        <img src={photoImageUrl} alt="Uploaded preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setPhotoImageUrl('')}
                          className="absolute top-2 right-2 p-1.5 bg-black/85 hover:bg-black text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-[16/9] bg-black hover:bg-zinc-950 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition-all gap-2 group p-4 text-center">
                        <Upload className={`w-8 h-8 ${isUploadingPhoto ? 'text-zinc-400 animate-pulse' : 'text-zinc-500 group-hover:text-red-500'} transition-colors`} />
                        <span className="text-xs text-zinc-400 group-hover:text-zinc-300 font-bold">{isUploadingPhoto ? 'Uploading...' : 'Click to choose a local image photo'}</span>
                        <span className="text-[10px] text-zinc-600 font-mono">JPG, PNG format under 5MB size</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={isUploadingPhoto}
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-red-600 hover:bg-red-700 text-white font-black tracking-widest text-xs uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" /> UPLOAD & PUBLISH TO GALLERY
                  </button>
                </form>
              </div>

              {/* Form 2: Add Video */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-between">
                <form onSubmit={handleAddVideo} className="flex flex-col gap-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-zinc-900 pb-3">
                    <Video className="w-4 h-4 text-red-500" /> EMBED WORKOUT VIDEO
                  </h3>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Video Title *</label>
                    <input
                      type="text"
                      required
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="e.g. Back Squat Hip Mobility Drills"
                      className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 outline-none focus:border-red-600/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Category *</label>
                      <select
                        value={videoCategory}
                        onChange={(e) => setVideoCategory(e.target.value)}
                        className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 leading-tight outline-none focus:border-red-600/50"
                      >
                        <option value="Strength Training">Strength Training</option>
                        <option value="Muscle Gain">Muscle Gain</option>
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    {videoCategory === 'Others' && (
                      <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-[10px] text-red-500 uppercase tracking-wider font-mono font-bold">Custom Category Name *</label>
                        <input
                          type="text"
                          required
                          value={videoCustomCategory}
                          onChange={(e) => setVideoCustomCategory(e.target.value)}
                          placeholder="e.g. Cardio, Yoga, Crossfit"
                          className="bg-black border border-red-950/40 px-3 py-2.5 rounded-lg text-zinc-200 outline-none focus:border-red-600/50"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">YouTube Link *</label>
                      <input
                        type="url"
                        required
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 outline-none focus:border-red-600/50"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Brief Description Sentence *</label>
                    <textarea
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Enter details on physical posture, reps targeted, and structural alignment focus."
                      rows={2}
                      className="bg-black border border-zinc-900 px-3 py-3 rounded-lg text-zinc-200 resize-none font-medium outline-none focus:border-red-600/50 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-red-600 hover:bg-red-700 text-white font-black tracking-widest text-xs uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" /> RECORD WORKOUT VIDEO EMBED
                  </button>
                </form>
              </div>
            </div>

            {/* List and Deletion area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              {/* Photo list */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl">
                <h4 className="text-zinc-200 font-black tracking-widest text-xs uppercase mb-4 font-mono pb-2 border-b border-zinc-900">
                  DATABASE PHOTOS ({galleryPhotos.length})
                </h4>
                {galleryPhotos.length === 0 ? (
                  <p className="text-zinc-600 italic font-mono py-6 text-center">No custom gallery photos found in Firestore database.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {galleryPhotos.map((p) => (
                      <div key={p.id} className="p-3 bg-black border border-zinc-900 rounded-xl flex flex-col gap-3">
                        {editingPhotoId === p.id ? (
                          <div className="flex flex-col gap-2 w-full animate-fadeIn text-[11px]">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-zinc-450 uppercase tracking-widest font-mono font-bold">Photo Title</label>
                              <input
                                type="text"
                                value={editPhotoTitle}
                                onChange={(e) => setEditPhotoTitle(e.target.value)}
                                className="bg-zinc-950 border border-zinc-900 px-2 py-1.5 rounded text-zinc-200 outline-none focus:border-red-650"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-zinc-450 uppercase tracking-widest font-mono font-bold">Category</label>
                                <select
                                  value={editPhotoCategory}
                                  onChange={(e) => setEditPhotoCategory(e.target.value)}
                                  className="bg-zinc-950 border border-zinc-900 px-2 py-1.5 rounded text-zinc-200 outline-none"
                                >
                                  <option value="Strength Training">Strength Training</option>
                                  <option value="Muscle Gain">Muscle Gain</option>
                                  <option value="Weight Loss">Weight Loss</option>
                                  <option value="Others">Others</option>
                                </select>
                              </div>
                              {editPhotoCategory === 'Others' && (
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] text-red-500 uppercase tracking-widest font-mono font-bold">Custom Name</label>
                                  <input
                                    type="text"
                                    value={editPhotoCustomCategory}
                                    onChange={(e) => setEditPhotoCustomCategory(e.target.value)}
                                    className="bg-zinc-950 border border-zinc-900 px-2 py-1.5 rounded text-zinc-200 outline-none focus:border-red-650"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-zinc-450 uppercase tracking-widest font-mono font-bold">Photo File</label>
                              <div className="flex items-center gap-3 bg-zinc-950 p-2 border border-zinc-900 rounded-xl">
                                {editPhotoImageUrl ? (
                                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-850 flex-shrink-0">
                                    <img src={editPhotoImageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[8px] text-zinc-500 font-bold uppercase font-mono">None</span>
                                  </div>
                                )}
                                <label className="flex-grow flex items-center justify-center py-2 px-3 border border-zinc-800 rounded-lg text-[10px] uppercase font-black tracking-widest text-zinc-350 hover:text-white bg-zinc-900 hover:bg-zinc-850 cursor-pointer transition-all">
                                  <span>Choose File</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEditPhotoUpload}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => setEditingPhotoId(null)}
                                className="px-3 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white rounded text-[10px] uppercase font-bold cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSavePhotoEdit(p.id)}
                                className="px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded text-[10px] uppercase font-bold cursor-pointer transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 justify-between w-full">
                            <div className="flex items-center gap-3 min-w-0 flex-grow">
                              <img src={p.imageUrl} alt={p.title} className="w-12 h-12 object-cover rounded-md flex-shrink-0" referrerPolicy="no-referrer" />
                              <div className="min-w-0">
                                <p className="font-bold text-zinc-200 truncate uppercase max-w-[140px] sm:max-w-xs">{p.title}</p>
                                <span className="inline-block text-[10px] text-red-500 font-mono tracking-wider mt-0.5 uppercase">{p.category}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditPhoto(p)}
                                className="p-2 border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-800 rounded-lg cursor-pointer transition-colors"
                                title="Edit photo info"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePhoto(p.id)}
                                className="p-2 border border-zinc-900 text-zinc-500 hover:text-red-500 hover:border-red-950/40 hover:bg-red-950/15 rounded-lg cursor-pointer transition-colors"
                                title="Delete photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video list */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl">
                <h4 className="text-zinc-200 font-black tracking-widest text-xs uppercase mb-4 font-mono pb-2 border-b border-zinc-900">
                  DATABASE VIDEOS ({galleryVideos.length})
                </h4>
                {galleryVideos.length === 0 ? (
                  <p className="text-zinc-600 italic font-mono py-6 text-center">No custom gallery videos found in Firestore database.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {galleryVideos.map((v) => (
                      <div key={v.id} className="p-3 bg-black border border-zinc-900 rounded-xl flex flex-col gap-3">
                        {editingVideoId === v.id ? (
                          <div className="flex flex-col gap-2 w-full animate-fadeIn text-[11px]">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-zinc-450 uppercase tracking-widest font-mono font-bold">Video Title</label>
                              <input
                                type="text"
                                value={editVideoTitle}
                                onChange={(e) => setEditVideoTitle(e.target.value)}
                                className="bg-zinc-950 border border-zinc-900 px-2 py-1.5 rounded text-zinc-200 outline-none focus:border-red-650"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-zinc-450 uppercase tracking-widest font-mono font-bold">Category</label>
                                <select
                                  value={editVideoCategory}
                                  onChange={(e) => setEditVideoCategory(e.target.value)}
                                  className="bg-zinc-950 border border-zinc-900 px-2 py-1.5 rounded text-zinc-200 outline-none"
                                >
                                  <option value="Strength Training">Strength Training</option>
                                  <option value="Muscle Gain">Muscle Gain</option>
                                  <option value="Weight Loss">Weight Loss</option>
                                  <option value="Others">Others</option>
                                </select>
                              </div>

                              {editVideoCategory === 'Others' && (
                                <div className="flex flex-col gap-1 col-span-2">
                                  <label className="text-[9px] text-red-500 uppercase tracking-widest font-mono font-bold">Custom Category Name *</label>
                                  <input
                                    type="text"
                                    required
                                    value={editVideoCustomCategory}
                                    onChange={(e) => setEditVideoCustomCategory(e.target.value)}
                                    placeholder="e.g. Mobility, Conditioning"
                                    className="bg-zinc-950 border border-red-950/40 px-2 py-1.5 rounded text-zinc-200 outline-none"
                                  />
                                </div>
                              )}
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-zinc-450 uppercase tracking-widest font-mono font-bold">YouTube URL</label>
                                <input
                                  type="text"
                                  value={editVideoUrl}
                                  onChange={(e) => setEditVideoUrl(e.target.value)}
                                  className="bg-zinc-950 border border-zinc-900 px-2 py-1.5 rounded text-zinc-200 outline-none focus:border-red-650"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-zinc-450 uppercase tracking-widest font-mono font-bold">Video Description</label>
                              <textarea
                                value={editVideoDescription}
                                onChange={(e) => setEditVideoDescription(e.target.value)}
                                rows={2}
                                className="bg-zinc-950 border border-zinc-900 px-2 py-1.5 rounded text-zinc-200 resize-none outline-none focus:border-red-650 leading-normal"
                              />
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => setEditingVideoId(null)}
                                className="px-3 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white rounded text-[10px] uppercase font-bold cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveVideoEdit(v.id)}
                                className="px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded text-[10px] uppercase font-bold cursor-pointer transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 justify-between w-full">
                            <div className="flex items-center gap-3 min-w-0 flex-grow">
                              <img src={v.thumbnailUrl || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300&auto=format&fit=crop'} alt={v.title} className="w-12 h-12 object-cover rounded-md flex-shrink-0" referrerPolicy="no-referrer" />
                              <div className="min-w-0">
                                <p className="font-bold text-zinc-200 truncate uppercase max-w-[140px] sm:max-w-xs">{v.title}</p>
                                <p className="text-[10px] text-red-500 font-mono tracking-wider mt-0.5 uppercase">{v.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditVideo(v)}
                                className="p-2 border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-800 rounded-lg cursor-pointer transition-colors"
                                title="Edit video details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVideo(v.id)}
                                className="p-2 border border-zinc-900 text-zinc-500 hover:text-red-500 hover:border-red-950/40 hover:bg-red-950/15 rounded-lg cursor-pointer transition-colors"
                                title="Delete video"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Tab: Reviews and Testimonials Manager */}
        {activeTab === 'reviews' && (() => {
          const pendingReviews = testimonials.filter(t => t.approved !== true);
          const approvedReviews = testimonials.filter(t => t.approved === true);

          return (
            <div className="flex flex-col gap-8 max-w-7xl animate-fadeIn">
              <div>
                <span className="text-red-500 font-mono text-[10px] font-black tracking-widest uppercase mb-1">
                  TESTIMONIAL CONTENT CONTROLLER
                </span>
                <h2 className="text-3xl font-black text-white">REVIEWS & CLIENT SATISFACTION</h2>
                <p className="text-zinc-500 text-xs mt-1">
                  Moderate client testimonial reviews submitted from the public website form. Review the feedback and agree to display them on the website.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs font-semibold">
                {/* Column 1: PENDING VERIFICATION AWAITING APPROVAL */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col min-h-[400px]">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-3 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      PENDING VERIFICATION ({pendingReviews.length})
                    </span>
                    <span className="text-[10px] text-zinc-500 font-normal">NEEDS COACH AGREEMENT</span>
                  </h3>

                  {pendingReviews.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center py-20 text-center text-zinc-600">
                      <MessageSquare className="w-12 h-12 mb-3 text-zinc-805" />
                      <p className="italic font-mono">No new reviews pending approval at this moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
                      {pendingReviews.map((test) => (
                        <div key={test.id} className="p-4 bg-black border border-zinc-900 rounded-2xl flex flex-col gap-3 hover:border-zinc-800 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex gap-3 items-center">
                              <img
                                src={test.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                                alt={test.clientName}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="font-bold text-sm text-white uppercase leading-tight">{test.clientName}</p>
                                <span className="inline-block mt-0.5 px-2 py-0.5 bg-zinc-900 border border-zinc-850 text-amber-500 text-[9px] font-bold font-mono uppercase rounded">
                                  {test.achievement}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <div className="flex items-center gap-0.5 mr-1 bg-zinc-950 p-1 rounded border border-zinc-900">
                                {Array.from({ length: Math.min(5, test.rating || 5) }).map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                ))}
                              </div>
                              <button
                                onClick={() => handleDeleteReview(test.id)}
                                className="p-1.5 border border-zinc-900 text-zinc-500 hover:text-red-500 hover:border-red-950/45 hover:bg-red-950/10 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                                title="Delete user review proposal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-zinc-400 font-medium text-xs font-mono leading-relaxed bg-[#070708] p-3 rounded-xl border border-zinc-900/55">
                            "{test.review}"
                          </p>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleToggleApproveReview(test.id, false)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black tracking-widest text-[9px] uppercase rounded-lg flex items-center gap-1.5 cursor-pointer shadow transition-all active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3px]" /> AGREE & PUBLISH LIVE
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column 2: APPROVED PUBLIC LIVE REVIEWS */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col min-h-[400px]">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-3 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      APPROVED PUBLIC LIVE ({approvedReviews.length})
                    </span>
                    <span className="text-[10px] text-zinc-500 font-normal">DISPLAYING ON WEBSITE</span>
                  </h3>

                  {approvedReviews.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center py-20 text-center text-zinc-650">
                      <MessageSquare className="w-12 h-12 mb-3 text-zinc-805" />
                      <p className="italic font-mono">No reviews are currently agreed & published on the live site.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
                      {approvedReviews.map((test) => (
                        <div key={test.id} className="p-4 bg-black border border-zinc-900 rounded-2xl flex flex-col gap-3 hover:border-zinc-800 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex gap-3 items-center">
                              <img
                                src={test.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                                alt={test.clientName}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="font-bold text-sm text-white uppercase leading-tight">{test.clientName}</p>
                                <span className="inline-block mt-0.5 px-2 py-0.5 bg-red-950/20 border border-red-900/30 text-red-500 text-[9px] font-bold font-mono uppercase rounded">
                                  {test.achievement}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <div className="flex items-center gap-0.5 mr-1 bg-zinc-950 p-1 rounded border border-zinc-900">
                                {Array.from({ length: Math.min(5, test.rating || 5) }).map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                ))}
                              </div>
                              <button
                                onClick={() => handleDeleteReview(test.id)}
                                className="p-1.5 border border-zinc-900 text-zinc-500 hover:text-red-500 hover:border-red-950/45 hover:bg-red-950/10 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                                title="Permanently delete review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-zinc-400 font-medium text-xs font-mono leading-relaxed bg-[#070708] p-3 rounded-xl border border-zinc-900/55">
                            "{test.review}"
                          </p>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleToggleApproveReview(test.id, true)}
                              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 font-black tracking-widest text-[9px] uppercase rounded-lg flex items-center gap-1.5 cursor-pointer shadow transition-all active:scale-95"
                            >
                              <X className="w-3.5 h-3.5 stroke-[3px]" /> AGREE REMOVAL / REVOKE
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Active Tab: Contact channels */}
        {activeTab === 'contact' && (
          <div className="flex flex-col gap-8 max-w-4xl">
            <div>
              <span className="text-red-500 font-mono text-[10px] font-black tracking-widest uppercase mb-1">
                COMMUNICATIONS CONSOLE
              </span>
              <h2 className="text-3xl font-black text-white">EDIT SIGNATURE CONTACT CHANNELS</h2>
              <p className="text-zinc-500 text-xs mt-1">
                Customize your phone numbers, Google Map addresses, active email routers and Instagram highlights dynamically across all page footers and forms.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl text-xs space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-red-500" /> Dial phone number *
                  </label>
                  <input
                    type="text"
                    value={homeConfigs.contactPhone || ''}
                    onChange={(e) => setHomeConfigs({ ...homeConfigs, contactPhone: e.target.value })}
                    className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 text-sm font-black outline-none focus:border-red-600/50"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-green-500" /> WhatsApp main-number *
                  </label>
                  <input
                    type="text"
                    value={homeConfigs.whatsappNumber || ''}
                    onChange={(e) => setHomeConfigs({ ...homeConfigs, whatsappNumber: e.target.value })}
                    className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 text-sm font-black outline-none focus:border-green-600/50"
                    placeholder="e.g. 919876543210"
                  />
                  <p className="text-[9px] text-zinc-500 leading-none">Numbers only with country code (no + or spaces) for link generation</p>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1">
                    <Mail className="w-3.5 h-3.5 text-red-500" /> Active email address *
                  </label>
                  <input
                    type="email"
                    value={homeConfigs.contactEmail || ''}
                    onChange={(e) => setHomeConfigs({ ...homeConfigs, contactEmail: e.target.value })}
                    className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 text-sm font-bold outline-none focus:border-red-600/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> Physical Location & Gym *
                  </label>
                  <textarea
                    value={homeConfigs.contactLocation || ''}
                    onChange={(e) => setHomeConfigs({ ...homeConfigs, contactLocation: e.target.value })}
                    rows={4}
                    className="bg-black border border-zinc-900 px-3 py-3 rounded-lg text-zinc-200 text-sm font-medium resize-none leading-relaxed outline-none focus:border-red-600/50"
                  />
                </div>

                <div className="flex flex-col gap-4 justify-between">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1">
                      <Instagram className="w-3.5 h-3.5 text-red-500" /> Instagram Profile URL *
                    </label>
                    <input
                      type="url"
                      value={homeConfigs.instagramUrl || ''}
                      onChange={(e) => setHomeConfigs({ ...homeConfigs, instagramUrl: e.target.value })}
                      className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 text-sm outline-none focus:border-red-600/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1 bg-zinc-950/80 border border-red-950/20 rounded-xl p-3 mt-1 text-xs">
                    <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1">
                      <Mail className="w-3.5 h-3.5 text-red-500" /> Web3Forms Email Integration Key
                    </label>
                    <input
                      type="text"
                      value={homeConfigs.web3FormsKey || ''}
                      onChange={(e) => setHomeConfigs({ ...homeConfigs, web3FormsKey: e.target.value })}
                      className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-300 text-xs font-mono outline-none focus:border-red-600/50"
                      placeholder="e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                    <p className="text-[9px] text-zinc-500 leading-normal mt-1">
                      To receive user submission forms immediately and automatically in your inbox (without mailto popups), get a free integration key from <a href="https://web3forms.com" target="_blank" rel="noreferrer" className="text-red-500 hover:underline">web3forms.com</a> (adds your email <span className="font-bold text-zinc-400">trainwithjijo@gmail.com</span>) then paste it above.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveHome}
                    className="w-full mt-2 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/40 transition-all active:scale-[0.98]"
                  >
                    <Save className="w-4.5 h-4.5" /> SAVE CONTACT CHANGES
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Tab: Coach Profile & Portrait */}
        {activeTab === 'coach' && (
          <div className="flex flex-col gap-8 max-w-5xl">
            <div>
              <span className="text-red-500 font-mono text-[10px] font-black tracking-widest uppercase mb-1">
                COACH BRAND IDENTITY
              </span>
              <h2 className="text-3xl font-black text-white">MANAGE COACHING PROFILE & PORTRAIT</h2>
              <p className="text-zinc-500 text-xs mt-1">
                Establish high authority by updating your profile picture, professional experience, and scientific performance bio. This will synchronize and update the Home and About pages.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Portrait Manager */}
              <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 flex flex-col gap-6 items-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono self-start border-b border-zinc-900 pb-2 w-full">
                  Coach Portrait Photo
                </span>

                <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-xl relative group">
                  <img
                    src={transformGoogleDriveUrl(coachProfile.imageUrl) || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=800&auto=format&fit=crop'}
                    alt="Mr. Delwin Jijo Coach Portrait Preview"
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <label className="p-4 bg-red-600 rounded-full text-white cursor-pointer hover:bg-red-700 transition-all font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Portrait
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoachPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono text-center">
                    OR PROVIDE PORTRAIT IMAGE DIRECT URL
                  </label>
                  <input
                    type="url"
                    value={coachProfile.imageUrl || ''}
                    onChange={(e) => setCoachProfile({ ...coachProfile, imageUrl: e.target.value })}
                    className="bg-black border border-zinc-900 px-3 py-2 rounded-lg text-zinc-300 text-xs outline-none focus:border-red-600/50 w-full"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 text-[11px] text-zinc-500 leading-relaxed w-full">
                  <p className="font-bold text-zinc-400 mb-1 flex items-center gap-1.5">
                    💡 PRO TIPS
                  </p>
                  To match the theme, upload a high-quality headshot portrait on a clean, light, off-white background with professional business or training wear. Try to use an image under 1.5MB for fast page renders.
                </div>
              </div>

              {/* Right Column: Profile Metadata and Bio Form */}
              <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 flex flex-col gap-6">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono border-b border-zinc-900 pb-2 w-full">
                  Professional Profile Copy
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      Full Coaching Name *
                    </label>
                    <input
                      type="text"
                      value={coachProfile.name || ''}
                      onChange={(e) => setCoachProfile({ ...coachProfile, name: e.target.value })}
                      className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 text-sm font-bold outline-none focus:border-red-600/50"
                      placeholder="e.g. Mr. Delwin Jijo Coach"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      Industry Experience Headline *
                    </label>
                    <input
                      type="text"
                      value={coachProfile.experience || ''}
                      onChange={(e) => setCoachProfile({ ...coachProfile, experience: e.target.value })}
                      className="bg-black border border-zinc-900 px-3 py-2.5 rounded-lg text-zinc-200 text-sm outline-none focus:border-red-600/50"
                      placeholder="e.g. 3+ Years Elite Strength Coaching"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-zinc-400 uppercase tracking-wider font-mono">
                    Scientific Biography / About Bio *
                  </label>
                  <textarea
                    value={coachProfile.aboutText || ''}
                    onChange={(e) => setCoachProfile({ ...coachProfile, aboutText: e.target.value })}
                    rows={6}
                    className="bg-black border border-zinc-900 px-3 py-3 rounded-lg text-zinc-200 text-sm leading-relaxed resize-none outline-none focus:border-red-600/50"
                    placeholder="Tell your life journey, scientific programming methodologies and overall client mission..."
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-xs border-t border-zinc-900 pt-4 mt-2">
                  <span className="font-bold text-red-500 uppercase tracking-wider font-mono mb-2">
                    Homepage Performance Statistics
                  </span>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-zinc-400 uppercase text-[10px]">Clients Coached</label>
                      <input
                        type="text"
                        value={coachProfile.statsClientsCount || '20+'}
                        onChange={(e) => setCoachProfile({ ...coachProfile, statsClientsCount: e.target.value })}
                        className="bg-black border border-zinc-900 px-3 py-2 rounded-lg text-zinc-200 text-xs font-mono outline-none text-center"
                        placeholder="e.g. 20+"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-zinc-400 uppercase text-[10px]">Experience</label>
                      <input
                        type="text"
                        value={coachProfile.statsExperienceYears || '3+ Years'}
                        onChange={(e) => setCoachProfile({ ...coachProfile, statsExperienceYears: e.target.value })}
                        className="bg-black border border-zinc-900 px-3 py-2 rounded-lg text-zinc-200 text-xs font-mono outline-none text-center"
                        placeholder="e.g. 3+ Years"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-zinc-400 uppercase text-[10px]">Coaching Hrs</label>
                      <input
                        type="text"
                        value={coachProfile.statsWorkoutsTrained || '5k+ Hrs'}
                        onChange={(e) => setCoachProfile({ ...coachProfile, statsWorkoutsTrained: e.target.value })}
                        className="bg-black border border-zinc-900 px-3 py-2 rounded-lg text-zinc-200 text-xs font-mono outline-none text-center"
                        placeholder="e.g. 5k+ Hrs"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-zinc-400 uppercase text-[10px]">Success Rate</label>
                      <input
                        type="text"
                        value={coachProfile.statsTransformationSuccess || '99%'}
                        onChange={(e) => setCoachProfile({ ...coachProfile, statsTransformationSuccess: e.target.value })}
                        className="bg-black border border-zinc-900 px-3 py-2 rounded-lg text-zinc-200 text-xs font-mono outline-none text-center"
                        placeholder="e.g. 99%"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveCoachProfile}
                  className="w-full mt-4 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/40 transition-all active:scale-[0.98]"
                >
                  <Save className="w-4.5 h-4.5" /> SAVE COACH PROFILE & PORTRAIT
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-left"
            >
              <h3 className="text-zinc-100 font-extrabold text-sm uppercase tracking-widest font-mono border-b border-zinc-900 pb-3 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                {confirmModal.title}
              </h3>
              <p className="text-zinc-400 text-xs sm:text-xs leading-relaxed font-sans">
                {confirmModal.message}
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-900 mt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white rounded-xl text-[10px] uppercase font-extrabold tracking-widest cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] uppercase font-extrabold tracking-widest cursor-pointer shadow-lg hover:shadow-red-950/20 active:scale-95 transition-all"
                >
                  {confirmModal.actionLabel || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
