/**
 * Admin real-data service — fetches live data from the database.
 *
 * This module replaces the mock data in src/lib/admin/data.ts with real
 * database queries. The admin dashboard components can switch from
 * MOCK_* constants to these functions without changing their structure.
 *
 * All functions are server-side only and should be called from
 * server components or API routes.
 */

import { db } from "@/lib/db";
import {
  users,
  profiles,
  content,
  communities,
  communityMembers,
  reports,
  auditLogs,
  subscriptions,
  contentViews,
  follows,
  saves,
  notifications,
  messages,
  conversations,
} from "@/lib/db/schema";
import { eq, desc, count, sql, and, gte } from "drizzle-orm";

/* ── Overview Metrics ─────────────────────────────────────────────────── */

export type RealOverviewMetrics = {
  totalUsers: number;
  activeUsers: number;
  totalCreators: number;
  publishedContent: number;
  openReports: number;
  totalSubscriptions: number;
  totalViews: number;
  totalCommunities: number;
};

export async function getRealOverviewMetrics(): Promise<RealOverviewMetrics> {
  const [
    totalUsersResult,
    activeUsersResult,
    totalCreatorsResult,
    publishedContentResult,
    openReportsResult,
    totalSubscriptionsResult,
    totalViewsResult,
    totalCommunitiesResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.status, "active"),
          gte(users.lastActiveAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        )
      ),
    db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "creator")),
    db
      .select({ count: count() })
      .from(content)
      .where(eq(content.status, "published")),
    db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.status, "open")),
    db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active")),
    db.select({ count: count() }).from(contentViews),
    db.select({ count: count() }).from(communities),
  ]);

  return {
    totalUsers: totalUsersResult[0]?.count ?? 0,
    activeUsers: activeUsersResult[0]?.count ?? 0,
    totalCreators: totalCreatorsResult[0]?.count ?? 0,
    publishedContent: publishedContentResult[0]?.count ?? 0,
    openReports: openReportsResult[0]?.count ?? 0,
    totalSubscriptions: totalSubscriptionsResult[0]?.count ?? 0,
    totalViews: totalViewsResult[0]?.count ?? 0,
    totalCommunities: totalCommunitiesResult[0]?.count ?? 0,
  };
}

/* ── Users ────────────────────────────────────────────────────────────── */

export type RealAdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
  lastActiveAt: string | null;
  contentCount: number;
  followerCount: number;
};

export async function getRealUsers(limit = 50): Promise<RealAdminUser[]> {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      joinedAt: users.createdAt,
      lastActiveAt: users.lastActiveAt,
      contentCount: sql<number>`(SELECT count(*) FROM ${content} WHERE ${content.creatorId} = ${users.id})`,
      followerCount: sql<number>`(SELECT count(*) FROM ${follows} WHERE ${follows.followeeId} = ${users.id})`,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);

  return result.map((u) => ({
    ...u,
    joinedAt: u.joinedAt.toISOString(),
    lastActiveAt: u.lastActiveAt?.toISOString() ?? null,
  }));
}

/* ── Content ──────────────────────────────────────────────────────────── */

export type RealAdminContent = {
  id: string;
  title: string;
  type: string;
  creator: string;
  status: string;
  publishedAt: string | null;
  viewCount: number;
  category: string | null;
};

export async function getRealContent(limit = 50): Promise<RealAdminContent[]> {
  const result = await db
    .select({
      id: content.id,
      title: content.title,
      type: content.type,
      creator: users.name,
      status: content.status,
      publishedAt: content.publishedAt,
      viewCount: sql<number>`(SELECT count(*) FROM ${contentViews} WHERE ${contentViews.contentId} = ${content.id})`,
      category: content.category,
    })
    .from(content)
    .innerJoin(users, eq(content.creatorId, users.id))
    .orderBy(desc(content.createdAt))
    .limit(limit);

  return result.map((c) => ({
    ...c,
    publishedAt: c.publishedAt?.toISOString() ?? null,
  }));
}

/* ── Reports ──────────────────────────────────────────────────────────── */

export type RealAdminReport = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  severity: string;
  status: string;
  createdAt: string;
  reporterName: string;
};

export async function getRealReports(limit = 50): Promise<RealAdminReport[]> {
  const result = await db
    .select({
      id: reports.id,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reason: reports.reason,
      severity: reports.severity,
      status: reports.status,
      createdAt: reports.createdAt,
      reporterName: users.name,
    })
    .from(reports)
    .innerJoin(users, eq(reports.reporterId, users.id))
    .orderBy(desc(reports.createdAt))
    .limit(limit);

  return result.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));
}

/* ── Communities ──────────────────────────────────────────────────────── */

export type RealAdminCommunity = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: string;
  ownerName: string;
  memberCount: number;
  createdAt: string;
};

export async function getRealCommunities(limit = 50): Promise<RealAdminCommunity[]> {
  const result = await db
    .select({
      id: communities.id,
      name: communities.name,
      slug: communities.slug,
      description: communities.description,
      visibility: communities.visibility,
      ownerName: users.name,
      memberCount: sql<number>`(SELECT count(*) FROM ${communityMembers} WHERE ${communityMembers.communityId} = ${communities.id})`,
      createdAt: communities.createdAt,
    })
    .from(communities)
    .innerJoin(users, eq(communities.ownerId, users.id))
    .orderBy(desc(communities.createdAt))
    .limit(limit);

  return result.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));
}

/* ── Audit Log ────────────────────────────────────────────────────────── */

export type RealAuditEntry = {
  id: string;
  actorName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
};

export async function getRealAuditLog(limit = 50): Promise<RealAuditEntry[]> {
  const result = await db
    .select({
      id: auditLogs.id,
      actorName: users.name,
      action: auditLogs.action,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return result.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));
}

/* ── Activity Feed ────────────────────────────────────────────────────── */

export type RealActivityEvent = {
  id: string;
  type: string;
  title: string;
  entity: string;
  timestamp: string;
};

export async function getRealActivityFeed(limit = 20): Promise<RealActivityEvent[]> {
  // Combine recent activity from multiple sources
  const [recentUsers, recentContent, recentReports, recentMessages] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5),
    db
      .select({
        id: content.id,
        title: content.title,
        createdAt: content.createdAt,
      })
      .from(content)
      .orderBy(desc(content.createdAt))
      .limit(5),
    db
      .select({
        id: reports.id,
        reason: reports.reason,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .orderBy(desc(reports.createdAt))
      .limit(5),
    db
      .select({
        id: messages.id,
        body: messages.body,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(5),
  ]);

  const events: RealActivityEvent[] = [
    ...recentUsers.map((u) => ({
      id: `user-${u.id}`,
      type: "user_joined",
      title: "New user joined",
      entity: u.name,
      timestamp: u.createdAt.toISOString(),
    })),
    ...recentContent.map((c) => ({
      id: `content-${c.id}`,
      type: "content_created",
      title: "Content created",
      entity: c.title,
      timestamp: c.createdAt.toISOString(),
    })),
    ...recentReports.map((r) => ({
      id: `report-${r.id}`,
      type: "report_filed",
      title: "Report filed",
      entity: r.reason,
      timestamp: r.createdAt.toISOString(),
    })),
    ...recentMessages.map((m) => ({
      id: `message-${m.id}`,
      type: "message_sent",
      title: "Message sent",
      entity: m.body.slice(0, 50),
      timestamp: m.createdAt.toISOString(),
    })),
  ];

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
}

/* ── Analytics ────────────────────────────────────────────────────────── */

export type AnalyticsPoint = {
  label: string;
  value: number;
};

export async function getRealUserGrowth(days = 30): Promise<AnalyticsPoint[]> {
  const result = await db
    .select({
      date: sql<string>`to_char(${users.createdAt}, 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(users)
    .where(gte(users.createdAt, new Date(Date.now() - days * 24 * 60 * 60 * 1000)))
    .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${users.createdAt}, 'YYYY-MM-DD')`);

  return result.map((r) => ({
    label: r.date,
    value: r.count,
  }));
}

export async function getRealContentEngagement(days = 30): Promise<AnalyticsPoint[]> {
  const result = await db
    .select({
      date: sql<string>`to_char(${contentViews.viewedAt}, 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(contentViews)
    .where(gte(contentViews.viewedAt, new Date(Date.now() - days * 24 * 60 * 60 * 1000)))
    .groupBy(sql`to_char(${contentViews.viewedAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${contentViews.viewedAt}, 'YYYY-MM-DD')`);

  return result.map((r) => ({
    label: r.date,
    value: r.count,
  }));
}
