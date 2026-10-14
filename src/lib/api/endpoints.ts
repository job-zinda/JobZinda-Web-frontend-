// Typed wrappers for every backend endpoint the web app uses.
// Paths/bodies follow job-zinda-backend/src/routes + controllers; where the Flutter
// app disagrees with the backend, the backend wins.

import { api, apiRaw } from "./client";
import type {
  Analytics,
  AppNotification,
  AssignedTask,
  AuthResult,
  AuthTokens,
  Banner,
  Category,
  ChatMessage,
  Comment,
  Conversation,
  Feedback,
  Follower,
  FreelancerMessage,
  JobSeeker,
  Paged,
  Plan,
  Post,
  Profile,
  RazorpayOrder,
  Referral,
  Reply,
  Story,
  WalletTxn,
} from "../types";

type PageParams = { pageNumber?: number; pageSize?: number };

function paged<T>(data: Record<string, unknown> | null | undefined, key: string): Paged<T> {
  const items = (data?.[key] as T[] | undefined) ?? [];
  return {
    items: Array.isArray(items) ? items : [],
    hasNext: Boolean(data?.hasNext),
    totalCount: (data?.totalCount ?? data?.count) as number | undefined,
  };
}

type Data = Record<string, unknown>;

/* ------------------------------- auth ------------------------------- */

export interface RegisterInput {
  name: string;
  username: string;
  password: string;
  countryCode: string;
  mobileNumber: string;
  email?: string;
  referralCode?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  lat?: number;
  lng?: number;
  deviceId?: string;
}

export const authApi = {
  loginUsername: (username: string, password: string) =>
    api<AuthResult>("auth/login-username", { method: "POST", body: { username, password }, noAuth: true }),
  register: (input: RegisterInput) =>
    api<AuthResult & { referralReward?: number; reward?: number }>("auth/register-username", {
      method: "POST",
      noAuth: true,
      body: { getNotifications: true, skills: [], ...input },
    }),
  sendEmailOtp: (email: string) => api("auth/send-email-otp", { method: "POST", body: { email }, noAuth: true }),
  verifyEmailOtp: (email: string, otp: string) =>
    api<Partial<AuthResult> & { isNewUser?: boolean; verifiedEmail?: string }>("auth/verify-email-otp", {
      method: "POST",
      body: { email, otp },
      noAuth: true,
    }),
  refresh: (refreshToken: string) =>
    api<{ tokens: AuthTokens }>("auth/refresh-tokens", { method: "POST", body: { refreshToken }, noAuth: true }),
  logout: (refreshToken: string) => api("auth/log-out", { method: "POST", body: { refreshToken } }),
};

/* ------------------------------- users ------------------------------ */

export interface NearbyFilters {
  lat?: number;
  lng?: number;
  distanceInKm?: number;
  gender?: string;
  rating?: number;
  handledProjectsCountFrom?: number;
  handledProjectsCountTo?: number;
  searchTag?: string;
  professionId?: string;
}

export const userApi = {
  me: () => api<{ profileDetails: Profile }>("user/get-profile-details").then((d) => d.profileDetails),
  profile: async (id: string, guest: boolean) => {
    const d = await api<{ profileDetails: Profile; isBlocked?: boolean }>(
      guest ? `user/public-profile/${id}` : `user/get-other-profile/${id}`,
      { noAuth: guest },
    );
    return { ...d.profileDetails, isBlocked: d.isBlocked ?? d.profileDetails?.isBlocked };
  },
  update: (body: Partial<Profile> & Data) =>
    api<{ profileDetails: Profile }>("user/update-profile", { method: "PUT", body }).then((d) => d.profileDetails),
  updateImage: (profileImageUrl: string) =>
    api<{ profileDetails: Profile }>("user/update-profile-image", { method: "PUT", body: { profileImageUrl } }),
  updateCover: (coverImage: string) =>
    api<{ profileDetails: Profile }>("user/update-cover-image", { method: "PUT", body: { coverImage } }),
  deleteAccount: () => api("user/delete-profile", { method: "PATCH" }),
  search: (params: PageParams & { searchTag?: string; professionId?: string }, guest: boolean) =>
    api<Data>(guest ? "user/public-profiles" : "user/get-other-profiles", {
      query: { pageSize: 10, ...params },
      noAuth: guest,
    }).then((d) => paged<Profile>(d, "profiles")),
  nearby: (filters: NearbyFilters, guest: boolean) =>
    api<Data>(guest ? "user/public-nearest-profiles" : "user/get-nearest-profiles", {
      query: { pageNumber: 1, pageSize: 1000, handledProjectsCountTo: 1000, ...filters } as Record<string, string | number | undefined>,
      noAuth: guest,
    }).then((d) => paged<Profile>(d, d && "users" in d ? "users" : "profiles")),
  visit: (profileId: string) => api("user/visit-profile", { method: "POST", body: { profileId } }),
  analytics: (dateFilter?: string) =>
    api<{ analytics: Analytics }>("user/get-profile-analytics", { query: { dateFilter } }).then((d) => d.analytics),
  rate: (profileId: string, rating: number, review: string) =>
    api("user/add-profile-rating", { method: "POST", body: { ratee: profileId, profileId, rating, review } }),
  feedbacks: (profileId: string, params: PageParams, guest: boolean) =>
    api<Data>(guest ? "user/public-profile-ratings" : "user/list-profile-feedBacks", {
      query: { profileId, pageSize: 10, ...params },
      noAuth: guest,
    }).then((d) => paged<Feedback>(d, "feedBacks")),
};

/* ------------------------------- posts ------------------------------ */

export type FeedKind = "suggested" | "following" | "public";

const FEED_PATH: Record<FeedKind, string> = {
  suggested: "post/getAllSuggestedPosts",
  following: "post/getAllFollowingPosts",
  public: "post/public-feed",
};

export interface NewPost {
  mediaType: "text" | "image" | "video";
  mediaUrl?: string;
  thumbnail?: string;
  bio?: string;
  duration?: number;
  sharedWith?: "all" | "followers";
  category?: string;
}

export const postApi = {
  feed: (kind: FeedKind, params: PageParams & { category?: string }) =>
    api<Data>(FEED_PATH[kind], { query: { pageSize: 10, ...params }, noAuth: kind === "public" }).then((d) =>
      paged<Post>(d, "posts"),
    ),
  mine: (params: PageParams) =>
    api<Data>("post/listMyPosts", { query: { pageSize: 12, ...params } }).then((d) => paged<Post>(d, "posts")),
  ofProfile: (profileId: string, params: PageParams, guest: boolean) =>
    api<Data>(guest ? "post/public-profile-posts" : "post/getOtherProfilePosts", {
      query: { profileId, pageSize: 12, ...params },
      noAuth: guest,
    }).then((d) => paged<Post>(d, "posts")),
  details: (postId: string) => api<{ post: Post }>(`post/getPostDetails/${postId}`).then((d) => d.post),
  create: (body: NewPost) => api<{ post: Post }>("post/addPost", { method: "POST", body }).then((d) => d.post),
  dailyQuota: () => api<Data>("post/daily-quota"),
  toggleLike: (postId: string) => api("post/addAlike", { method: "POST", body: { postId } }),
  remove: (postId: string) => api(`post/removeMyPost/${postId}`, { method: "DELETE" }),
};

/* ------------------------- comments & replies ------------------------ */

export const commentApi = {
  list: (postId: string, params: PageParams) =>
    api<Data>(`postComment/viewComments/${postId}`, { query: { pageSize: 10, ...params } }).then((d) =>
      paged<Comment>(d, "comments"),
    ),
  add: (postId: string, comment: string) =>
    api("postComment/addComment", { method: "POST", body: { postId, post: postId, comment } }),
  remove: (commentId: string) => api(`postComment/removeComment/${commentId}`, { method: "DELETE" }),
  replies: (commentId: string) =>
    api<Data>(`postComment/reply/listRepliesUser/${commentId}`, { query: { pageNumber: 1, pageSize: 100 } }).then(
      (d) => paged<Reply>(d, "replies"),
    ),
  reply: (commentId: string, reply: string) =>
    api("postComment/reply/addReply", { method: "POST", body: { commentId, reply } }),
  removeReply: (replyId: string) => api(`postComment/reply/deleteReply/${replyId}`, { method: "DELETE" }),
};

/* ------------------------------ stories ----------------------------- */

export const storyApi = {
  list: (params: PageParams) =>
    api<Data>("story/listStories", { query: { pageSize: 20, ...params } }).then((d) => paged<Story>(d, "stories")),
  mine: () => api<{ story: Story | null }>("story/getMyStory").then((d) => d.story),
  create: (media: { mediaType: "image" | "video"; content: string; duration?: number }, description = "") =>
    api("story/createStory", {
      method: "POST",
      body: { notificationType: "other", media: [{ duration: 0, ...media }], description, caption: "" },
    }),
  markViewed: (storyId: string, lastViewedMediaId: string) =>
    api("story/updateStoryView", { method: "POST", body: { storyId, lastViewedMediaId } }),
  removeMedia: (storyId: string, mediaId: string) =>
    api(`story/removeStory/${storyId}/${mediaId}`, { method: "DELETE" }),
  // No `viewers`: story/getStoryViewCount reads storyId/mediaId from a GET body,
  // which browsers can't send. Needs a backend change (query params) first.
};

/* ------------------------------ social ------------------------------ */

export const socialApi = {
  follow: (profileId: string) => api("follower/followUser", { method: "POST", body: { profileId } }),
  unfollow: (profileId: string) => api("follower/unFollowUser", { method: "POST", body: { profileId } }),
  /** The backend only lists the logged-in user's own followers/following. */
  followers: (params: PageParams & { searchTag?: string }) =>
    api<Data>("follower/listAllFollowers", { query: { pageSize: 20, ...params } }).then((d) =>
      paged<Follower>(d, "followers"),
    ),
  following: (params: PageParams & { searchTag?: string }) =>
    api<Data>("follower/listAllFollowing", { query: { pageSize: 20, ...params } }).then((d) =>
      paged<Follower>(d, "following"),
    ),
  block: (profileId: string, selectedReasons: string[] = []) =>
    api("block/block-user", { method: "POST", body: { blockedAccountId: profileId, selectedReasons } }),
  unblock: (profileId: string) =>
    api("block/unblock-user", { method: "DELETE", body: { blockedAccountId: profileId } }),
  report: (profileId: string, reason = "") =>
    api("report/reportProfile", { method: "POST", body: { profileId, reason } }),
};

/* ------------------------------- chat ------------------------------- */

export const chatApi = {
  conversations: (filter: "all" | "unread" = "all") =>
    api<Data>("conversation/listConversations", {
      query: { pageSize: 1000, pageNumber: 1, filter: filter === "unread" ? "unread" : undefined },
    }).then((d) => paged<Conversation>(d, "conversations")),
  messages: (conversationId: string) =>
    api<Data>(`conversation/getAllMessage/${conversationId}`, { query: { pageNumber: 1, pageSize: 1000 } }).then(
      (d) => paged<ChatMessage>(d, "messages"),
    ),
  messagesWith: (profileId: string) =>
    api<Data>(`conversation/listAllMessages/${profileId}`, { query: { pageNumber: 1, pageSize: 1000 } }).then(
      (d) => paged<ChatMessage>(d, "messages"),
    ),
  send: (profileId: string, content: string, messageType: ChatMessage["messageType"] = "text") =>
    api<{ message: ChatMessage }>("conversation/sentMessage", { method: "POST", body: { profileId, content, messageType } }),
  markRead: (conversationId: string, lastMessageId: string) =>
    api("conversation/updateChat", { method: "POST", body: { conversationId, lastMessageId } }),
  unreadCount: () =>
    api<{ totalUnreadCount: number }>("conversation/user-message-unread-count").then((d) => d.totalUnreadCount ?? 0),
  /** "Lets plan" — the support thread with the JobZinda admin. */
  supportMessages: () =>
    api<Data>("conversation/listAllQueryMessages", { query: { pageNumber: 1, pageSize: 1000 } }).then((d) =>
      paged<ChatMessage>(d, "messages"),
    ),
  sendSupport: (content: string, messageType: ChatMessage["messageType"] = "text") =>
    api("query/sentQuery", { method: "POST", body: { content, messageType } }),
  supportUnreadCount: () =>
    api<{ totalUnreadCount: number }>("conversation/admin-message-unread-count").then((d) => d.totalUnreadCount ?? 0),
};

/* --------------------------- notifications -------------------------- */

export const notificationApi = {
  list: (params: PageParams & { notificationType?: string }) =>
    api<Data>("notification/listNotification", { query: { pageSize: 15, ...params } }).then((d) =>
      paged<AppNotification>(d, "notifications"),
    ),
  count: () => api<{ totalCount: number }>("notification/getNotificationCount").then((d) => d.totalCount ?? 0),
  markRead: (id: string) => api(`notification/markAsRead/${id}`, { method: "PATCH" }),
  markAllRead: () => api("notification/markAllAsRead", { method: "PATCH" }),
  remove: (id: string) => api(`notification/deleteNotification/${id}`, { method: "DELETE" }),
  removeAll: () => api("notification/deleteAllNotification", { method: "DELETE" }),
};

/* ----------------------------- content ------------------------------ */

export const contentApi = {
  banners: (guest: boolean) =>
    api<Data>(guest ? "banner/public-banners" : "banner/listBannersUser", { noAuth: guest }).then(
      (d) => paged<Banner>(d, "banners").items,
    ),
  categories: () =>
    api<Data>("category/customer/get-categories", { query: { pageNumber: 1, pageSize: 100 }, noAuth: true }).then(
      (d) => paged<Category>(d, "categories").items,
    ),
};

/* --------------------------- monetisation --------------------------- */

export const subscriptionApi = {
  plans: () =>
    api<Data>("subscription/listSubscriptionPlans", { query: { pageNumber: 1, pageSize: 20 } }).then(
      (d) => paged<Plan>(d, "plans").items,
    ),
  create: (planId: string) =>
    api<{ subscription: RazorpayOrder }>("subscription/addSubscription", { method: "POST", body: { planId } }).then(
      (d) => d.subscription,
    ),
  verify: (orderId: string, paymentId: string, signature: string) =>
    api("subscription/verifyPayment", {
      method: "POST",
      body: { orderId, paymentId },
      headers: { "x-razorpay-signature": signature },
    }),
  mine: () => api<{ subscription: Data | null }>("subscription/getMySubscription").then((d) => d.subscription),
};

export const walletApi = {
  // These endpoints answer with raw JSON (no {status,data} envelope).
  transactions: (userId: string, limit = 50) =>
    apiRaw<WalletTxn[] | { data?: WalletTxn[] }>("wallet/getWalletTransactions", { query: { userId, limit } }).then(
      (r) => (Array.isArray(r) ? r : (r?.data ?? [])),
    ),
  requestWithdrawal: (userId: string, amount: number, upiId: string) =>
    apiRaw<{ message?: string }>("wallet/requestWithdrawal", { method: "POST", body: { userId, amount, upiId } }),
  withdrawals: () => apiRaw<Data>("wallet/myWithdrawals", { query: { pageNumber: 1, pageSize: 50 } }),
};

export const referralApi = {
  mine: (params: PageParams) =>
    api<Data>("referral/listMyReferrals", { query: { pageSize: 20, ...params } }).then((d) =>
      paged<Referral>(d, "referrals"),
    ),
};

export const courseApi = {
  mine: () => apiRaw<Data>("course-purchase/my"),
  createOrder: (referralCode?: string) =>
    apiRaw<RazorpayOrder & { data?: RazorpayOrder }>("course-purchase/createOrder", {
      method: "POST",
      body: { referralCode: referralCode || undefined },
    }).then((r) => (r?.data ?? r) as RazorpayOrder),
  verify: (orderId: string, paymentId: string, razorpay_signature: string) =>
    apiRaw<Data>("course-purchase/verifyPayment", { method: "POST", body: { orderId, paymentId, razorpay_signature } }),
};

/* ------------------------------ extras ------------------------------ */

export const extrasApi = {
  plansForYou: (params: PageParams) =>
    api<Data>("freelancer-message/my-freelancer-messages", { query: { pageSize: 20, ...params } }).then((d) =>
      paged<FreelancerMessage>(d, "messages"),
    ),
  assignedTasks: () =>
    apiRaw<AssignedTask[] | { data?: AssignedTask[] }>("assigned-task/user").then((r) =>
      Array.isArray(r) ? r : (r?.data ?? []),
    ),
  submitEvidence: (assignedTaskId: string, file: File) => {
    const form = new FormData();
    form.append("evidence", file);
    return apiRaw(`assigned-task/${assignedTaskId}/submit-evidence`, { method: "POST", body: form });
  },
  rateApp: (rating: number, review: string) =>
    api("app-rating/createAppRating", { method: "POST", body: { rating, review } }),
};

/* ---------------------------- job seeker ---------------------------- */
// Wired exactly as the Flutter app calls them (not present in the local backend).

export const jobSeekerApi = {
  submit: (body: JobSeeker) => api("job-seeker/submit", { method: "POST", body }),
  mine: () =>
    api<JobSeeker[] | Data>("job-seeker/my-submissions").then((d) =>
      Array.isArray(d) ? d : ((d?.submissions ?? d?.items ?? []) as JobSeeker[]),
    ),
  update: (id: string, body: JobSeeker) => api(`job-seeker/update/${id}`, { method: "PUT", body }),
  remove: (id: string) => api(`job-seeker/delete/${id}`, { method: "DELETE" }),
};
