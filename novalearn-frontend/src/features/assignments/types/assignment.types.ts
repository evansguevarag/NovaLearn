export type AssignmentStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CLOSED";

export interface Assignment {
  id: number;
  moduleId: number;
  moduleTitle: string;
  moduleSortOrder: number;
  courseId: number;
  courseTitle: string;
  createdById: number;
  createdByName: string;
  title: string;
  instructions: string;
  status: AssignmentStatus;
  availableFrom: string | null;
  dueAt: string | null;
  maxScore: number;
  allowTextSubmission: boolean;
  allowFileSubmission: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentRequest {
  moduleId: number;
  title: string;
  instructions: string;
  status: AssignmentStatus;
  availableFrom: string | null;
  dueAt: string | null;
  maxScore: number;
  allowTextSubmission: boolean;
  allowFileSubmission: boolean;
}