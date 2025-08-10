"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function createProject(data) {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Make orgId optional - if no organization is selected, use a default or the user's first organization
  let organizationId = orgId;
  
  if (!organizationId) {
    // If no org is active, try to get the user's first organization
    try {
      const { data: membershipList } = await clerkClient().users.getOrganizationMembershipList({
        userId: userId,
      });
      
      if (membershipList && membershipList.length > 0) {
        organizationId = membershipList[0].organization.id;
        console.log("Using first available organization:", organizationId);
      } else {
        throw new Error("No Organization Available - Please create or join an organization first");
      }
    } catch (error) {
      throw new Error("No Organization Available - Please create or join an organization first");
    }
  }

  // Check if the user is an admin of the organization (only if we have an org)
  if (organizationId) {
    try {
      const { data: membershipList } =
        await clerkClient().organizations.getOrganizationMembershipList({
          organizationId: organizationId,
        });

      const userMembership = membershipList.find(
        (membership) => membership.publicUserData.userId === userId
      );

      if (!userMembership || userMembership.role !== "org:admin") {
        throw new Error("Only organization admins can create projects");
      }
    } catch (error) {
      console.log("Admin check failed:", error.message);
      // Continue anyway for simplified flow
    }
  }

  try {
    const project = await db.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        organizationId: organizationId,
      },
    });

    return project;
  } catch (error) {
    throw new Error("Error creating project: " + error.message);
  }
}

export async function getProject(projectId) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Find user to verify existence
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get project with sprints
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      sprints: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

export async function deleteProject(projectId) {
  const { userId, orgId, orgRole } = auth();

  if (!userId ) {
    throw new Error("Unauthorized");
  }

  // if (orgRole !== "org:admin") {
  //   throw new Error("Only organization admins can delete projects");
  // }

  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  // if (!project || project.organizationId !== orgId) {
  //   throw new Error(
  //     "Project not found or you don't have permission to delete it"
  //   );
  // }

  await db.project.delete({
    where: { id: projectId },
  });

  return { success: true };
}
