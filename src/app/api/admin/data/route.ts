/**
 * GET /api/admin/data
 *
 * Returns real platform data for the admin dashboard.
 * This endpoint is protected by the admin middleware.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import {
  users,
  content,
  communities,
  reports,
  subscriptions,
  contentViews,
} from "@/lib/db/schema";
import { eq, desc, count, sql, and, gte } from "drizzle-orm";

export async function GET() {
  try {
    const [
      totalUsersResult,
      activeUsersResult,
      totalCreatorsResult,
      publishedContentResult,
      openReportsResult,
      totalSubscriptionsResult,
      totalViewsResult,
      totalCommunitiesResult,
      recentUsers,
      recentContent,
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
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(5),
      db
        .select({
          id: content.id,
          title: content.title,
          type: content.type,
          status: content.status,
          createdAt: content.createdAt,
        })
        .from(content)
        .orderBy(desc(content.createdAt))
        .limit(5),
    ]);

    return NextResponse.json({
      ok: true,
      metrics: {
        totalUsers: totalUsersResult[0]?.count ?? 0,
        activeUsers: activeUsersResult[0]?.count ?? 0,
        totalCreators: totalCreatorsResult[0]?.count ?? 0,
        publishedContent: publishedContentResult[0]?.count ?? 0,
        openReports: openReportsResult[0]?.count ?? 0,
        totalSubscriptions: totalSubscriptionsResult[0]?.count ?? 0,
        totalViews: totalViewsResult[0]?.count ?? 0,
        totalCommunities: totalCommunitiesResult[0]?.count ?? 0,
      },
      recentUsers: recentUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      recentContent: recentContent.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[ADMIN DATA] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}
