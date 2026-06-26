import { api } from "@/lib/api";

import type {
  Assignment,
  AssignmentRequest,
} from "@/features/assignments/types/assignment.types";
import type {
  CourseContentContext,
} from "@/features/instructor-content/services/course-content.service";

function getBasePath(
  context: CourseContentContext
): string {
  return context === "ADMIN"
    ? "/admin/assignments"
    : "/instructor/assignments";
}

export async function getManagedAssignments(
  context: CourseContentContext,
  courseId: number
): Promise<Assignment[]> {
  const response = await api.get<Assignment[]>(
    `${getBasePath(context)}/course/${courseId}`
  );

  return response.data;
}

export async function createManagedAssignment(
  context: CourseContentContext,
  request: AssignmentRequest
): Promise<Assignment> {
  const response = await api.post<Assignment>(
    getBasePath(context),
    request
  );

  return response.data;
}

export async function updateManagedAssignment(
  context: CourseContentContext,
  assignmentId: number,
  request: AssignmentRequest
): Promise<Assignment> {
  const response = await api.put<Assignment>(
    `${getBasePath(context)}/${assignmentId}`,
    request
  );

  return response.data;
}

export async function deleteManagedAssignment(
  context: CourseContentContext,
  assignmentId: number
): Promise<void> {
  await api.delete(
    `${getBasePath(context)}/${assignmentId}`
  );
}