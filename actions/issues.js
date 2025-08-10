"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getIssuesForSprint(sprintId) {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const issues = await db.issue.findMany({
    where: { sprintId: sprintId },
    orderBy: [{ status: "asc" }, { order: "asc" }],
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issues;
}

export async function createIssue(projectId, data) {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  let user = await db.user.findUnique({ where: { clerkUserId: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  const lastIssue = await db.issue.findFirst({
    where: { projectId, status: data.status },
    orderBy: { order: "desc" },
  });

  const newOrder = lastIssue ? lastIssue.order + 1 : 0;

  const issue = await db.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: projectId,
      sprintId: data.sprintId,
      reporterId: user.id,
      assigneeId: data.assigneeId || null,
      order: newOrder,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issue;
}

export async function updateIssue(issueId, data) {
  const { userId, orgId, orgRole } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get the current user and issue details
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const existingIssue = await db.issue.findUnique({
    where: { id: issueId },
    include: { 
      reporter: true,
      project: true 
    },
  });

  if (!existingIssue) {
    throw new Error("Issue not found");
  }

  // Check permissions: only reporter or org admin can update
  const isReporter = existingIssue.reporter.clerkUserId === userId;
  const isOrgAdmin = orgId && orgRole === "org:admin" && existingIssue.project.organizationId === orgId;

  if (!isReporter && !isOrgAdmin) {
    throw new Error("Only the issue reporter or organization admin can update this issue");
  }

  const issue = await db.issue.update({
    where: { id: issueId },
    data: data,
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issue;
}

export async function deleteIssue(issueId) {
  const { userId, orgId, orgRole } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get the current user and issue details
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const existingIssue = await db.issue.findUnique({
    where: { id: issueId },
    include: { 
      reporter: true,
      project: true 
    },
  });

  if (!existingIssue) {
    throw new Error("Issue not found");
  }

  // Check permissions: only reporter or org admin can delete
  const isReporter = existingIssue.reporter.clerkUserId === userId;
  const isOrgAdmin = orgId && orgRole === "org:admin" && existingIssue.project.organizationId === orgId;

  if (!isReporter && !isOrgAdmin) {
    throw new Error("Only the issue reporter or organization admin can delete this issue");
  }

  await db.issue.delete({
    where: { id: issueId },
  });

  return { success: true };
}

export async function updateIssueOrder(issues) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const transaction = issues.map((issue) =>
    db.issue.update({
      where: { id: issue.id },
      data: {
        status: issue.status,
        order: issue.order,
      },
    })
  );

  await db.$transaction(transaction);

  return { success: true };
}
