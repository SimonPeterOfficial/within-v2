/**
 * WithIn Admin — Mock data layer.
 *
 * All data lives here, separated from presentation. When a real backend
 * exists, replace these constants with API calls — components do not change.
 *
 * ARCHITECTURE:
 *   Admin UI → Admin Auth → Role Check → Server Action / API → Database
 *
 * These models are intentionally typed to match what a real API would return.
 */

/* ── Users ──────────────────────────────────────────────────────────── */

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "creator" | "admin";
  status: "active" | "inactive" | "suspended";
  joinedAt: string;
  lastActiveAt: string;
  moodCount: number;
  sanctuaryAccess: boolean;
};

export const MOCK_USERS: AdminUser[] = [
  { id: "u1", name: "Ava Chen", email: "ava.c@email.com", avatar: "🌙", role: "user", status: "active", joinedAt: "2025-11-12", lastActiveAt: "2026-08-17", moodCount: 34, sanctuaryAccess: true },
  { id: "u2", name: "Marcus Wright", email: "mwright@email.com", avatar: "🔥", role: "creator", status: "active", joinedAt: "2025-09-03", lastActiveAt: "2026-08-16", moodCount: 52, sanctuaryAccess: true },
  { id: "u3", name: "Lina Johansson", email: "lina.j@email.com", avatar: "🌊", role: "user", status: "active", joinedAt: "2026-01-18", lastActiveAt: "2026-08-15", moodCount: 18, sanctuaryAccess: true },
  { id: "u4", name: "Diego Ramirez", email: "d.ramirez@email.com", avatar: "🪐", role: "user", status: "inactive", joinedAt: "2025-12-22", lastActiveAt: "2026-06-01", moodCount: 7, sanctuaryAccess: false },
  { id: "u5", name: "Priya Sharma", email: "priya.s@email.com", avatar: "✨", role: "creator", status: "active", joinedAt: "2025-08-15", lastActiveAt: "2026-08-17", moodCount: 61, sanctuaryAccess: true },
  { id: "u6", name: "Noah Kim", email: "noah.k@email.com", avatar: "🌸", role: "user", status: "active", joinedAt: "2026-03-09", lastActiveAt: "2026-08-14", moodCount: 23, sanctuaryAccess: true },
  { id: "u7", name: "Sofia Lopez", email: "s.lopez@email.com", avatar: "🌅", role: "admin", status: "active", joinedAt: "2025-07-01", lastActiveAt: "2026-08-17", moodCount: 0, sanctuaryAccess: true },
  { id: "u8", name: "Ethan Brooks", email: "e.brooks@email.com", avatar: "🏮", role: "user", status: "suspended", joinedAt: "2026-02-14", lastActiveAt: "2026-05-20", moodCount: 3, sanctuaryAccess: false },
  { id: "u9", name: "Mia Nakamura", email: "mia.n@email.com", avatar: "💌", role: "creator", status: "active", joinedAt: "2025-10-28", lastActiveAt: "2026-08-16", moodCount: 45, sanctuaryAccess: true },
  { id: "u10", name: "Oliver Patel", email: "o.patel@email.com", avatar: "🌧", role: "user", status: "active", joinedAt: "2026-04-02", lastActiveAt: "2026-08-13", moodCount: 11, sanctuaryAccess: true },
  { id: "u11", name: "Amara Osei", email: "amara.o@email.com", avatar: "🔥", role: "creator", status: "active", joinedAt: "2025-11-01", lastActiveAt: "2026-08-17", moodCount: 38, sanctuaryAccess: true },
  { id: "u12", name: "Leo Andersen", email: "leo.a@email.com", avatar: "🔭", role: "user", status: "active", joinedAt: "2026-05-19", lastActiveAt: "2026-08-12", moodCount: 9, sanctuaryAccess: true },
];

/* ── Creators ───────────────────────────────────────────────────────── */

export type AdminCreator = {
  id: string;
  userId: string;
  name: string;
  handle: string;
  category: string;
  status: "verified" | "pending" | "suspended";
  appliedAt: string;
  verifiedAt?: string;
  contentCount: number;
  totalEngagement: number;
  followers: number;
};

export const MOCK_CREATORS: AdminCreator[] = [
  { id: "c1", userId: "u2", name: "Marcus Wright", handle: "@marcuswright", category: "Film", status: "verified", appliedAt: "2025-09-01", verifiedAt: "2025-09-03", contentCount: 8, totalEngagement: 14200, followers: 12840 },
  { id: "c2", userId: "u5", name: "Priya Sharma", handle: "@priyasharma", category: "Music", status: "verified", appliedAt: "2025-08-10", verifiedAt: "2025-08-15", contentCount: 12, totalEngagement: 22400, followers: 18900 },
  { id: "c3", userId: "u9", name: "Mia Nakamura", handle: "@mianakamura", category: "Photography", status: "verified", appliedAt: "2025-10-25", verifiedAt: "2025-10-28", contentCount: 15, totalEngagement: 18700, followers: 15320 },
  { id: "c4", userId: "u11", name: "Amara Osei", handle: "@amaraosei", category: "Books", status: "verified", appliedAt: "2025-10-28", verifiedAt: "2025-11-01", contentCount: 6, totalEngagement: 9800, followers: 7394 },
  { id: "c5", userId: "u6", name: "Noah Kim", handle: "@noahkim", category: "Stories", status: "pending", appliedAt: "2026-08-01", contentCount: 0, totalEngagement: 0, followers: 234 },
];

/* ── Content ────────────────────────────────────────────────────────── */

export type AdminContent = {
  id: string;
  title: string;
  type: "Original" | "Book" | "Album" | "Photo" | "Community" | "Story";
  creator: string;
  status: "published" | "draft" | "pending" | "flagged" | "archived";
  publishedAt?: string;
  views: number;
  likes: number;
  reports: number;
  category: string;
};

export const MOCK_CONTENT: AdminContent[] = [
  { id: "ct1", title: "Salt & Stars", type: "Original", creator: "Marcus Wright", status: "published", publishedAt: "2026-04-01", views: 48200, likes: 3200, reports: 0, category: "Films" },
  { id: "ct2", title: "The Quiet Tide", type: "Original", creator: "The Quiet Studio", status: "published", publishedAt: "2026-02-14", views: 35100, likes: 2800, reports: 1, category: "Films" },
  { id: "ct3", title: "Paper Constellations", type: "Book", creator: "Elena Marek", status: "published", publishedAt: "2026-03-10", views: 22400, likes: 1900, reports: 0, category: "Books" },
  { id: "ct4", title: "Night Garden", type: "Album", creator: "Mira", status: "published", publishedAt: "2026-05-05", views: 18900, likes: 2100, reports: 0, category: "Music" },
  { id: "ct5", title: "Embers", type: "Album", creator: "Nocturne", status: "published", publishedAt: "2026-03-20", views: 15600, likes: 1700, reports: 0, category: "Music" },
  { id: "ct6", title: "Salt flats at dusk", type: "Photo", creator: "Lena Vos", status: "published", publishedAt: "2026-03-05", views: 12300, likes: 1400, reports: 0, category: "Photography" },
  { id: "ct7", title: "Midnight Garden", type: "Original", creator: "Lena Vos", status: "pending", views: 0, likes: 0, reports: 0, category: "Films" },
  { id: "ct8", title: "The Last Aurora", type: "Original", creator: "Sofia Marchetti", status: "draft", views: 0, likes: 0, reports: 0, category: "Films" },
  { id: "ct9", title: "Echoes of Home", type: "Original", creator: "Ibrahim Cole", status: "published", publishedAt: "2026-01-10", views: 28700, likes: 2400, reports: 2, category: "Films" },
  { id: "ct10", title: "Rainfall Studies", type: "Album", creator: "Aster", status: "published", publishedAt: "2026-04-12", views: 11200, likes: 1300, reports: 0, category: "Music" },
  { id: "ct11", title: "Letters to the Moon", type: "Story", creator: "Noor Adeyemi", status: "flagged", views: 8400, likes: 640, reports: 3, category: "Stories" },
  { id: "ct12", title: "The Lighthouse Keeper", type: "Story", creator: "Jonas Wu", status: "published", publishedAt: "2026-01-20", views: 9200, likes: 780, reports: 0, category: "Stories" },
];

/* ── Reports / Moderation ───────────────────────────────────────────── */

export type AdminReport = {
  id: string;
  contentType: string;
  contentTitle: string;
  creator: string;
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "reviewing" | "escalated" | "resolved";
  reportedAt: string;
  reporterId: string;
};

export const MOCK_REPORTS: AdminReport[] = [
  { id: "r1", contentType: "Story", contentTitle: "Letters to the Moon", creator: "Noor Adeyemi", reason: "Inappropriate language in comments", severity: "medium", status: "pending", reportedAt: "2026-08-15T14:30:00Z", reporterId: "u3" },
  { id: "r2", contentType: "Original", contentTitle: "Echoes of Home", creator: "Ibrahim Cole", reason: "Copyright concern — music licensing", severity: "high", status: "reviewing", reportedAt: "2026-08-14T09:15:00Z", reporterId: "u10" },
  { id: "r3", contentType: "Story", contentTitle: "The Ember Fields", creator: "Omar Hale", reason: "Community guideline violation", severity: "low", status: "resolved", reportedAt: "2026-08-10T18:45:00Z", reporterId: "u6" },
  { id: "r4", contentType: "Community Post", contentTitle: "Moonwater general chat", creator: "Anonymous", reason: "Spam content in community", severity: "medium", status: "escalated", reportedAt: "2026-08-12T11:20:00Z", reporterId: "u1" },
  { id: "r5", contentType: "Photo", contentTitle: "Rain on glass", creator: "Mira Chen", reason: "Misattributed creative commons image", severity: "low", status: "pending", reportedAt: "2026-08-16T08:00:00Z", reporterId: "u4" },
  { id: "r6", contentType: "Comment", contentTitle: "Comment on Paper Constellations", creator: "Anonymous user", reason: "Harassment in discussion thread", severity: "critical", status: "escalated", reportedAt: "2026-08-17T02:10:00Z", reporterId: "u9" },
];

/* ── Analytics ──────────────────────────────────────────────────────── */

export type AnalyticsPoint = {
  label: string;
  value: number;
};

export const MOCK_USER_GROWTH: AnalyticsPoint[] = [
  { label: "Jan", value: 420 },
  { label: "Feb", value: 580 },
  { label: "Mar", value: 890 },
  { label: "Apr", value: 1340 },
  { label: "May", value: 1820 },
  { label: "Jun", value: 2410 },
  { label: "Jul", value: 3180 },
  { label: "Aug", value: 4200 },
];

export const MOCK_CONTENT_ENGAGEMENT: AnalyticsPoint[] = [
  { label: "Jan", value: 12400 },
  { label: "Feb", value: 18900 },
  { label: "Mar", value: 28400 },
  { label: "Apr", value: 41200 },
  { label: "May", value: 52800 },
  { label: "Jun", value: 68900 },
  { label: "Jul", value: 89200 },
  { label: "Aug", value: 124500 },
];

export const MOCK_CREATOR_ACTIVITY: AnalyticsPoint[] = [
  { label: "Jan", value: 8 },
  { label: "Feb", value: 12 },
  { label: "Mar", value: 18 },
  { label: "Apr", value: 24 },
  { label: "May", value: 31 },
  { label: "Jun", value: 38 },
  { label: "Jul", value: 45 },
  { label: "Aug", value: 52 },
];

export const MOCK_COMMUNITY_ACTIVITY: AnalyticsPoint[] = [
  { label: "Jan", value: 320 },
  { label: "Feb", value: 480 },
  { label: "Mar", value: 720 },
  { label: "Apr", value: 1100 },
  { label: "May", value: 1640 },
  { label: "Jun", value: 2280 },
  { label: "Jul", value: 3100 },
  { label: "Aug", value: 4200 },
];

/* ── Activity Feed ──────────────────────────────────────────────────── */

export type ActivityEvent = {
  id: string;
  type: "creator_joined" | "content_published" | "community_milestone" | "report_filed" | "creator_verified" | "subscription_event";
  icon: string;
  title: string;
  entity: string;
  timestamp: string;
  status: "success" | "warning" | "info" | "error";
};

export const MOCK_ACTIVITY: ActivityEvent[] = [
  { id: "a1", type: "creator_joined", icon: "✨", title: "New creator applied", entity: "Noah Kim — Stories", timestamp: "2 hours ago", status: "info" },
  { id: "a2", type: "content_published", icon: "🎬", title: "Original published", entity: "Salt & Stars by Marcus Wright", timestamp: "5 hours ago", status: "success" },
  { id: "a3", type: "community_milestone", icon: "🤝", title: "Community milestone", entity: "Moonwater reached 1,200 members", timestamp: "8 hours ago", status: "success" },
  { id: "a4", type: "report_filed", icon: "⚠️", title: "Content reported", entity: "Comment on Paper Constellations — harassment", timestamp: "12 hours ago", status: "error" },
  { id: "a5", type: "creator_verified", icon: "✓", title: "Creator verified", entity: "Amara Osei — Books", timestamp: "1 day ago", status: "success" },
  { id: "a6", type: "subscription_event", icon: "💳", title: "New subscription", entity: "Pro plan — 3 new subscribers", timestamp: "1 day ago", status: "info" },
  { id: "a7", type: "content_published", icon: "📷", title: "Photography collection", entity: "5 new photos by Lena Vos", timestamp: "2 days ago", status: "success" },
  { id: "a8", type: "creator_joined", icon: "✨", title: "New creator applied", entity: "Aisha Bello — Photography", timestamp: "2 days ago", status: "info" },
  { id: "a9", type: "community_milestone", icon: "🤝", title: "Community milestone", entity: "Dawn Chorus reached 2,300 members", timestamp: "3 days ago", status: "success" },
  { id: "a10", type: "report_filed", icon: "⚠️", title: "Content reported", entity: "Letters to the Moon — inappropriate language", timestamp: "3 days ago", status: "warning" },
];

/* ── Audit Log ──────────────────────────────────────────────────────── */

export type AuditEntry = {
  id: string;
  admin: string;
  action: string;
  target: string;
  timestamp: string;
  result: "success" | "denied" | "pending";
};

export const MOCK_AUDIT: AuditEntry[] = [
  { id: "al1", admin: "Sofia Lopez", action: "Verified creator", target: "Amara Osei", timestamp: "2026-08-16T14:20:00Z", result: "success" },
  { id: "al2", admin: "Sofia Lopez", action: "Resolved report", target: "The Ember Fields comment", timestamp: "2026-08-14T10:45:00Z", result: "success" },
  { id: "al3", admin: "Sofia Lopez", action: "Escalated report", target: "Moonwater spam", timestamp: "2026-08-12T11:30:00Z", result: "success" },
  { id: "al4", admin: "System", action: "Auto-flagged content", target: "Letters to the Moon", timestamp: "2026-08-10T18:00:00Z", result: "pending" },
  { id: "al5", admin: "Sofia Lopez", action: "Updated feature flag", target: "Auri — suggestion frequency", timestamp: "2026-08-08T09:15:00Z", result: "success" },
  { id: "al6", admin: "Sofia Lopez", action: "Changed platform setting", target: "Community auto-moderation → on", timestamp: "2026-08-05T16:00:00Z", result: "success" },
  { id: "al7", admin: "System", action: "Auto-escalated report", target: "Comment on Paper Constellations", timestamp: "2026-08-17T02:15:00Z", result: "success" },
  { id: "al8", admin: "Sofia Lopez", action: "Published Original", target: "Salt & Stars", timestamp: "2026-04-01T08:00:00Z", result: "success" },
];

/* ── Feature Flags ──────────────────────────────────────────────────── */

export type FeatureFlag = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: "all" | "staging" | "production";
  category: "core" | "content" | "social" | "experimental";
};

export const MOCK_FEATURES: FeatureFlag[] = [
  { id: "f1", name: "Auri", description: "AI companion presence across the platform", enabled: true, environment: "all", category: "core" },
  { id: "f2", name: "Communities", description: "Community rooms and discussions", enabled: true, environment: "all", category: "social" },
  { id: "f3", name: "Originals", description: "WithIn Originals — films, series, books", enabled: true, environment: "all", category: "content" },
  { id: "f4", name: "Creator Monetization", description: "Creator earnings and payout system", enabled: false, environment: "staging", category: "core" },
  { id: "f5", name: "Music", description: "Music discovery and playback", enabled: true, environment: "all", category: "content" },
  { id: "f6", name: "Photography", description: "Photography gallery and discovery", enabled: true, environment: "all", category: "content" },
  { id: "f7", name: "New Onboarding", description: "Redesigned onboarding flow with mood wizard", enabled: true, environment: "all", category: "experimental" },
  { id: "f8", name: "Experimental UI", description: "New glass effects and presence system", enabled: true, environment: "staging", category: "experimental" },
  { id: "f9", name: "Voice Notes", description: "Voice note recording in sanctuary journal", enabled: false, environment: "staging", category: "core" },
  { id: "f10", name: "Subscriptions", description: "Pro subscription tier with premium features", enabled: true, environment: "all", category: "core" },
];

/* ── Overview Metrics ───────────────────────────────────────────────── */

export type OverviewMetric = {
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: string;
};

export const OVERVIEW_METRICS: OverviewMetric[] = [
  { label: "Total Users", value: "4,200", change: "+18%", changeType: "up", icon: "👥" },
  { label: "Active Users", value: "2,840", change: "+12%", changeType: "up", icon: "🟢" },
  { label: "Creators", value: "52", change: "+8", changeType: "up", icon: "✨" },
  { label: "Published Content", value: "312", change: "+24", changeType: "up", icon: "📚" },
  { label: "Community Activity", value: "4.2K", change: "+35%", changeType: "up", icon: "🤝" },
  { label: "Open Reports", value: "6", change: "+2", changeType: "down", icon: "⚠️" },
  { label: "Subscriptions", value: "890", change: "+45", changeType: "up", icon: "💳" },
  { label: "Revenue", value: "$12.4K", change: "+22%", changeType: "up", icon: "💰" },
];

/* ── Settings ───────────────────────────────────────────────────────── */

export type AdminSetting = {
  id: string;
  section: string;
  key: string;
  label: string;
  value: string | boolean;
  type: "toggle" | "text" | "select";
  options?: string[];
};

export const MOCK_SETTINGS: AdminSetting[] = [
  { id: "s1", section: "Platform", key: "platform_name", label: "Platform Name", value: "WithIn", type: "text" },
  { id: "s2", section: "Platform", key: "maintenance_mode", label: "Maintenance Mode", value: false, type: "toggle" },
  { id: "s3", section: "Content", key: "auto_approve", label: "Auto-approve content from verified creators", value: true, type: "toggle" },
  { id: "s4", section: "Content", key: "max_upload_size", label: "Max Upload Size (MB)", value: "50", type: "text" },
  { id: "s5", section: "Moderation", key: "auto_moderation", label: "Auto-moderation", value: true, type: "toggle" },
  { id: "s6", section: "Moderation", key: "flag_threshold", label: "Auto-flag after reports", value: "3", type: "select", options: ["1", "2", "3", "5"] },
  { id: "s7", section: "Community", key: "public_communities", label: "Allow public communities", value: true, type: "toggle" },
  { id: "s8", section: "Community", key: "max_members", label: "Max members per community", value: "5000", type: "text" },
  { id: "s9", section: "Auri", key: "auri_enabled", label: "Auri availability", value: true, type: "toggle" },
  { id: "s10", section: "Auri", key: "auri_suggestion_freq", label: "Suggestion frequency", value: "balanced", type: "select", options: ["minimal", "balanced", "active"] },
  { id: "s11", section: "Notifications", key: "email_notifications", label: "Email notifications", value: true, type: "toggle" },
  { id: "s12", section: "Appearance", key: "theme", label: "Default theme", value: "dark", type: "select", options: ["dark", "light", "system"] },
];
