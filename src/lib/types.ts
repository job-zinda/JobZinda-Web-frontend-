// Shapes returned by job-zinda-backend (see the matching Flutter models in
// jobzindaflutterfinal/lib/model). Fields are optional because the backend's
// projections differ between endpoints.

export interface UserRef {
  _id: string;
  name?: string;
  profileImageUrl?: string;
  email?: string;
}

export interface Experience {
  title?: string;
  company?: string;
  duration?: string;
  description?: string;
  isCurrent?: boolean;
}

export interface Profile {
  _id: string;
  name?: string;
  userName?: string;
  username?: string;
  email?: string;
  countryCode?: string;
  mobileNumber?: string;
  accountType?: string; // "normal" | "Freelancer" | ...
  profession?: string;
  professionId?: string;
  bio?: string;
  gender?: string;
  address?: string;
  district?: string;
  state?: string;
  zipcode?: string;
  lat?: number;
  lng?: number;
  location?: { type?: string; coordinates?: [number, number] };
  skills?: string[];
  experiences?: Experience[];
  profileImageUrl?: string;
  followersCount?: number;
  followingCount?: number;
  projectsCount?: number;
  rating?: number;
  isFollowing?: boolean;
  isBlocked?: boolean;
  isVerified?: boolean;
  coinBalance?: number;
  walletBalance?: number;
  totalEarnings?: number;
  referralCode?: string;
  referredBy?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  whatsappLink?: string;
  directCallLink?: string;
  instagramLink?: string;
  linkedinLink?: string;
  getNotifications?: boolean;
  createdAt?: string;
}

export interface PostAuthor {
  _id: string;
  userName?: string;
  userProfilePicture?: string;
  professionId?: string;
  professionName?: string;
  isVerified?: boolean;
}

export type MediaType = "text" | "image" | "video";

export interface Post {
  _id: string;
  bio?: string;
  mediaType: MediaType;
  mediaUrl?: string;
  thumbnail?: string;
  duration?: number;
  likesCount?: number;
  commentsCount?: number;
  shareCount?: number;
  isLiked?: boolean;
  sharedWith?: "all" | "followers";
  /** Feeds return a populated author; "my posts" return the bare user id. */
  user: PostAuthor | string;
  createdAt?: string;
}

export interface Comment {
  _id: string;
  post: string;
  comment: string;
  commentedBy?: UserRef;
  replyCount?: number;
  createdAt?: string;
}

export interface Reply {
  _id: string;
  comment: string;
  reply: string;
  repliedBy?: UserRef;
  createdAt?: string;
}

export interface StoryMedia {
  _id: string;
  mediaType: "image" | "video" | "text";
  content: string;
  duration?: number;
  postedAt?: string;
}

export interface Story {
  _id: string;
  user: string | UserRef;
  userName?: string;
  userProfileImg?: string;
  media: StoryMedia[];
  description?: string;
  caption?: string;
  createdAt?: string;
  lastUploadedMedia?: string;
}

export interface StoryViewer {
  _id: string;
  user?: UserRef;
}

export interface Conversation {
  _id: string;
  participants: { _id?: string; userId?: UserRef; lastReadMessageId?: string }[];
  lastMessage?: {
    _id?: string;
    content?: string;
    createdAt?: string;
    senderId?: string;
    messageId?: { content?: string; messageType?: string; createdAt?: string; senderId?: string };
  };
  unreadCount?: number;
  createdUser?: string;
  updatedAt?: string;
}

export type MessageType = "text" | "image" | "audio" | "video";

export interface ChatMessage {
  _id: string;
  conversationId?: string;
  senderId?: UserRef | string;
  content: string;
  messageType: MessageType;
  attachments?: unknown[];
  createdAt?: string;
}

export interface AppNotification {
  _id: string;
  title?: string;
  description?: string;
  notificationType?: string;
  onTapNavigate?: string;
  sentOn?: string;
  viewStatus?: boolean;
  mediaUrl?: string;
  sender?: UserRef;
  connectedProfileId?: UserRef;
  connectedPostId?: { _id: string; mediaUrl?: string; user?: string };
  connectedTaskId?: string;
  connectedTransactionId?: string;
}

export interface Banner {
  _id: string;
  title?: string;
  bannerImageUrl?: string;
  mediaUrl?: string;
  position?: "top" | "middle" | "bottom" | string;
  indexNumber?: number;
  bannerOnTapAction?: string;
  linkDirection?: string;
  subscriptionPlanId?: string;
}

export interface Category {
  _id: string;
  name: string;
  sortNumber?: number;
}

export interface Feedback {
  _id: string;
  rater?: UserRef;
  ratee?: string;
  rating: number;
  review?: string;
  createdAt?: string;
}

export interface Follower {
  _id: string;
  followerId?: string;
  followingId?: string;
  followedOn?: string;
  followingDetails?: UserRef;
}

export interface Analytics {
  totalFollowers?: number;
  filteredFollowers?: number;
  followersGrowth?: number;
  unFollowCount?: number;
  totalProfileViews?: number;
  totalFeedback?: number;
  totalProjects?: number;
  totalRatings?: number;
  averageRating?: number;
}

export interface Plan {
  _id: string;
  planName: string;
  planType?: string;
  planTag?: string;
  amount?: number;
  amountMRP?: number;
  billableAmount?: number;
  discountPercentage?: number;
  currency?: string;
  currencySymbol?: string;
  durationDays?: number;
  planAmountPer?: string;
  planFeatures?: string[];
  planIcon?: string;
  isSubscribed?: boolean;
}

export interface RazorpayOrder {
  id: string;
  key_id?: string;
  amount: number;
  currency?: string;
  notes?: { fullName?: string; phone?: string; email?: string };
}

export interface WalletTxn {
  _id: string;
  amount: number;
  source?: string;
  status?: string;
  transactionType?: "credit" | "debit" | string;
  message?: string;
  createdAt?: string;
}

export interface Referral {
  _id: string;
  name?: string;
  email?: string;
  profileImageUrl?: string;
  referralCode?: string;
  referralCoins?: number;
  claimStatus?: string;
  createdAt?: string;
}

export interface FreelancerMessage {
  _id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  whatsappLink?: string;
  createdAt?: string;
}

export interface AssignedTask {
  _id: string;
  status?: string;
  evidenceUrl?: string;
  reviewComment?: string;
  task?: {
    _id: string;
    title?: string;
    description?: string;
    dueDate?: string;
    commissionAmount?: number;
    taskLink?: string;
    caption?: string;
    adminDocumentUrl?: string;
    referenceImageUrl?: string;
    allowDownload?: boolean;
    allowShare?: boolean;
  };
  [key: string]: unknown;
}

export type JobType = "looking_for_job" | "looking_for_employee";

export interface JobSeeker {
  _id?: string;
  fullName: string;
  phone: string;
  email?: string;
  whatsappNumber?: string;
  location: string;
  jobType: JobType;
  desiredRole: string;
  skills: string[];
  experienceLevel: string;
  expectedSalary: string;
  workMode: string;
  availability: string;
  status?: "pending" | "approved" | "rejected" | string;
  createdAt?: string;
}

export interface Paged<T> {
  items: T[];
  hasNext: boolean;
  totalCount?: number;
}

export interface AuthTokens {
  access: { token: string; expires?: string };
  refresh: { token: string; expires?: string };
}

export interface AuthResult {
  user: Profile;
  tokens: AuthTokens;
}
