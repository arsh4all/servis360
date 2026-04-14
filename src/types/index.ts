// ─────────────────────────────────────────────
// Servis360.mu – Shared TypeScript Types
// ─────────────────────────────────────────────

export type Role = 'CUSTOMER' | 'WORKER' | 'ADMIN';
export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DECLINED';
export type PricingType = 'HOURLY' | 'FIXED';
export type PlanType = 'FREE' | 'PREMIUM';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'WORKER';
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
}

// ─── Services ────────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

// ─── Workers ─────────────────────────────────────────────────────────────────

export interface WorkerProfile {
  id: string;
  userId: string;
  profileImage: string | null;
  bio: string | null;
  experienceYears: number;
  location: string;
  isVerified: boolean;
  isApproved: boolean;
  ratingAvg: number;
  totalReviews: number;
  totalBookings: number;
  isAvailable: boolean;
  isFeatured: boolean;
  responseTime: string | null;
}

export interface WorkerService {
  id: string;
  price: number;
  pricingType: PricingType;
  service: Service;
}

export interface WorkerPublicProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  profile: WorkerProfile;
  services: WorkerService[];
  recentReviews: Review[];
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  customerId: string;
  workerId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  address: string;
  addressNotes: string | null;
  notes: string | null;
  status: BookingStatus;
  totalPrice: number;
  platformFee: number;
  workerEarning: number;
  isPaid: boolean;
  createdAt: string;
  customer?: Partial<PublicUser>;
  worker?: Partial<PublicUser>;
  service?: Service;
  review?: Review | null;
}

export interface CreateBookingInput {
  workerId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  address: string;
  addressNotes?: string;
  notes?: string;
  totalPrice: number;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  workerId: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  createdAt: string;
  customer?: Partial<PublicUser>;
}

export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment?: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface CustomerDashboardStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalSpent: number;
}

export interface WorkerDashboardStats {
  totalBookings: number;
  pendingRequests: number;
  completedBookings: number;
  totalEarnings: number;
  ratingAvg: number;
  totalReviews: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalWorkers: number;
  totalCustomers: number;
  pendingApprovals: number;
  totalBookings: number;
  activeBookings: number;
  monthlyRevenue: number;
  totalRevenue: number;
}
