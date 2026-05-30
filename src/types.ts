export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'client';
  createdAt: any;
}

export interface TrainerProfile {
  id: string;
  name: string;
  aboutText: string;
  experience: string;
  imageUrl: string;
  instagramUrl?: string;
  contactEmail?: string;
  phone?: string;
  whatsappNumber?: string;
  location?: string;
  statsClientsCount?: string;
  statsExperienceYears?: string;
  statsWorkoutsTrained?: string;
  statsTransformationSuccess?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  type: 'workout' | 'transformation';
  beforeUrl?: string;
  afterUrl?: string;
  createdAt: any;
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description: string;
  createdAt: any;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  rating: number;
  review: string;
  achievement: string;
  imageUrl?: string;
  approved?: boolean;
  createdAt: any;
}

export interface Enquiry {
  id: string;
  name: string;
  mobile: string;
  email: string;
  goal: string;
  message: string;
  timestamp: any;
}

export interface HomepageContent {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  statsClientsCount: string;
  statsExperienceYears: string;
  statsWorkoutsTrained: string;
  highlightQuote: string;
  contactPhone?: string;
  contactEmail?: string;
  contactLocation?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
  web3FormsKey?: string;
}
