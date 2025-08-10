"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getOrganization(slug) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get the organization details
  const organization = await clerkClient().organizations.getOrganization({
    slug,
  });

  if (!organization) {
    return null;
  }

  // Check if user belongs to this organization
  const { data: membership } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: organization.id,
    });

  const userMembership = membership.find(
    (member) => member.publicUserData.userId === userId
  );

  // If user is not a member, return null
  if (!userMembership) {
    return null;
  }

  return organization;
}

export async function getProjects(orgId) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // If no orgId provided, get projects from all user's organizations
  if (!orgId) {
    // Get all user's organizations and their projects
    try {
      const { data: membershipList } = await clerkClient().users.getOrganizationMembershipList({
        userId: userId,
      });
      
      if (membershipList && membershipList.length > 0) {
        const orgIds = membershipList.map(membership => membership.organization.id);
        const projects = await db.project.findMany({
          where: { 
            organizationId: {
              in: orgIds
            }
          },
          orderBy: { createdAt: "desc" },
        });
        return projects;
      }
    } catch (error) {
      console.log("Error getting user organizations:", error);
    }
    
    // Return empty array if no organizations
    return [];
  }

  const projects = await db.project.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

export async function getUserIssues(userId) {
  const { orgId } = auth();

  if (!userId) {
    throw new Error("No user id found");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Build the where clause - if orgId exists, filter by it, otherwise get all user's issues
  let whereClause = {
    OR: [{ assigneeId: user.id }, { reporterId: user.id }],
  };

  if (orgId) {
    whereClause.project = {
      organizationId: orgId,
    };
  }

  const issues = await db.issue.findMany({
    where: whereClause,
    include: {
      project: true,
      assignee: true,
      reporter: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return issues;
}

export async function getOrganizationUsers(orgId) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!orgId) {
    // If no orgId, return just the current user
    return [user];
  }

  try {
    const organizationMemberships =
      await clerkClient().organizations.getOrganizationMembershipList({
        organizationId: orgId,
      });

    const userIds = organizationMemberships.data.map(
      (membership) => membership.publicUserData.userId
    );

    const users = await db.user.findMany({
      where: {
        clerkUserId: {
          in: userIds,
        },
      },
    });

    return users;
  } catch (error) {
    console.log("Error getting organization users:", error);
    // Return just the current user if organization lookup fails
    return [user];
  }
}
